import { Worker, Job, UnrecoverableError } from 'bullmq';
import React from 'react';
import { OPTIMIZE_RESUME_QUEUE_NAME } from '../queues/optimizeResume.queue.js';
import { updateResumeRepository } from '../../modules/students/repositories/optimizeResume.repository.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../../infra/redis.config.js';
import { CACHE_KEYS } from '../utils/cacheKeys.js';
import { callLLM, callLLMText } from '../utils/llmHelper.js';
import {
    BRANCH_ROLE_CLASSIFIER_SYSTEM,
    CONTENT_INVENTORY_SYSTEM,
    CEILING_ESTIMATOR_SYSTEM,
    DOMAIN_ANALYZER_SYSTEM,
    DOMAIN_OPTIMIZER_SYSTEM,
    FABRICATION_DETECTOR_SYSTEM,
    DOMAIN_CRITIQUE_SYSTEM,
    GAP_REPORT_SYSTEM,
    RESUME_JSON_MAPPER_SYSTEM,
} from '../utils/prompts/stagePrompts.js';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumeTemplate } from '../utils/templates/resumeTemplate.js';
import { uploadBufferToCloudinary } from '../utils/fileHandler/cloudinary.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

// 1. Define LangGraph State Annotation
const ResumeOptimizerStateAnnotation = Annotation.Root({
    userId: Annotation<number>(),
    resumeId: Annotation<number>(),
    rawText: Annotation<string>(),
    detectedBranch: Annotation<string>(),
    detectedRole: Annotation<string>(),
    roleCategory: Annotation<string>(),
    contentInventory: Annotation<Record<string, any>>(),
    estimatedCeiling: Annotation<number>(),
    candidateTier: Annotation<string>(),
    analyzerOutput: Annotation<Record<string, any>>(),
    currentResume: Annotation<string>(),
    previousResume: Annotation<string>(),
    presentationScore: Annotation<number>(),
    contentScore: Annotation<number>(),
    improvementDelta: Annotation<number>(),
    iterationCount: Annotation<number>(),
    maxIterations: Annotation<number>(),
    fabricationLog: Annotation<string[]>(),
    fabricationsFound: Annotation<boolean>(),
    previousCritiqueFeedback: Annotation<string>(),
    finalResumeJson: Annotation<Record<string, any> | null>(),
    gapReport: Annotation<Record<string, any> | null>(),
    error: Annotation<string | null>(),
});

// 2. Define Node Functions
const classifierNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running classifierNode...');
    const classification: any = await callLLM(
        BRANCH_ROLE_CLASSIFIER_SYSTEM,
        `Resume text to classify:\n\n${state.rawText}`
    );
    return {
        detectedBranch: classification.detectedBranch,
        detectedRole: classification.detectedRole,
        roleCategory: classification.roleCategory,
    };
};

const inventoryNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running inventoryNode...');
    const inventory = await callLLM(
        CONTENT_INVENTORY_SYSTEM,
        `Resume text to inventory:\n\n${state.rawText}`
    );
    return { contentInventory: inventory as Record<string, any> };
};

const estimatorNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running estimatorNode...');
    const estimation: any = await callLLM(
        CEILING_ESTIMATOR_SYSTEM,
        JSON.stringify({
            contentInventory: state.contentInventory,
            detectedRole: state.detectedRole,
        })
    );
    const maxIterations = 1;
    return {
        estimatedCeiling: estimation.estimatedCeiling,
        candidateTier: estimation.candidateTier,
        maxIterations,
    };
};

const analyzerNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running analyzerNode...');
    const analysis = await callLLM(
        DOMAIN_ANALYZER_SYSTEM,
        JSON.stringify({
            contentInventory: state.contentInventory,
            detectedRole: state.detectedRole,
        })
    );
    return { analyzerOutput: analysis as Record<string, any> };
};

const optimizerNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    const nextIter = state.iterationCount + 1;
    console.log(`[LangGraph] Running optimizerNode (Iteration ${nextIter})...`);
    const userContent = JSON.stringify({
        contentInventory: state.contentInventory,
        detectedRole: state.detectedRole,
        roleCategory: state.roleCategory,
        previousCritiqueFeedback: state.previousCritiqueFeedback || 'Initial optimization',
        previousResumeText: state.currentResume || state.rawText,
    });
    const optimizedText = await callLLMText(DOMAIN_OPTIMIZER_SYSTEM, userContent);
    return {
        currentResume: optimizedText,
        iterationCount: nextIter,
    };
};

const fabricationDetectorNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running fabricationDetectorNode...');
    const check: any = await callLLM(
        FABRICATION_DETECTOR_SYSTEM,
        JSON.stringify({
            contentInventory: state.contentInventory,
            optimizedResumeText: state.currentResume,
        })
    );
    const fabricationLog = [...(state.fabricationLog || [])];
    if (check.fabricationsFound && check.flaggedItems) {
        fabricationLog.push(`Iteration ${state.iterationCount}: ${check.flaggedItems.join(', ')}`);
    }
    return {
        fabricationsFound: check.fabricationsFound,
        fabricationLog,
    };
};

const critiqueNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running critiqueNode...');
    const result: any = await callLLM(
        DOMAIN_CRITIQUE_SYSTEM,
        JSON.stringify({
            contentInventory: state.contentInventory,
            optimizedResumeText: state.currentResume,
        })
    );
    return {
        presentationScore: result.presentationScore,
        contentScore: result.contentScore,
        improvementDelta: result.improvementDelta,
        previousCritiqueFeedback: result.nextIterationFocus,
    };
};

const jsonMapperNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running jsonMapperNode...');
    const finalJson = await callLLM(
        RESUME_JSON_MAPPER_SYSTEM,
        `Optimized Resume Plain Text:\n\n${state.currentResume}`
    );
    return { finalResumeJson: finalJson as Record<string, any> };
};

const gapReportNode = async (state: typeof ResumeOptimizerStateAnnotation.State) => {
    console.log('[LangGraph] Running gapReportNode...');
    const report = await callLLM(
        GAP_REPORT_SYSTEM,
        JSON.stringify({
            contentInventory: state.contentInventory,
            detectedRole: state.detectedRole,
            candidateTier: state.candidateTier,
            analyzerOutput: state.analyzerOutput,
        })
    );
    return { gapReport: report as Record<string, any> };
};

// 3. Setup Workflow Graph
const workflow = new StateGraph(ResumeOptimizerStateAnnotation)
    .addNode('classifier', classifierNode)
    .addNode('inventory', inventoryNode)
    .addNode('estimator', estimatorNode)
    .addNode('analyzer', analyzerNode)
    .addNode('optimizer', optimizerNode)
    .addNode('fabricationDetector', fabricationDetectorNode)
    .addNode('critique', critiqueNode)
    .addNode('jsonMapper', jsonMapperNode)
    .addNode('gapReporter', gapReportNode);

workflow.addEdge(START, 'classifier');
workflow.addEdge('classifier', 'inventory');
workflow.addEdge('inventory', 'estimator');
workflow.addEdge('estimator', 'analyzer');
workflow.addEdge('analyzer', 'optimizer');
workflow.addEdge('optimizer', 'fabricationDetector');
workflow.addEdge('fabricationDetector', 'critique');

// Conditional transition based on loop criteria
const shouldContinue = (state: typeof ResumeOptimizerStateAnnotation.State) => {
    if (state.iterationCount >= 1) return 'generateGapReport';

    const isBelowCeiling = state.presentationScore < state.estimatedCeiling;
    const hasMoreIterations = state.iterationCount < state.maxIterations;

    console.log(
        `[LangGraph Decision] Iteration ${state.iterationCount}/${state.maxIterations} | Presentation Score: ${state.presentationScore}/${state.estimatedCeiling} | Fabrications Found: ${state.fabricationsFound}`
    );

    if (hasMoreIterations && (state.fabricationsFound || isBelowCeiling)) {
        console.log('[LangGraph Decision] Looping back to optimizerNode.');
        return 'optimizer';
    }
    console.log('[LangGraph Decision] Optimization complete. Transitioning to jsonMapperNode.');
    return 'jsonMapper';
};

workflow.addConditionalEdges('critique', shouldContinue, {
    optimizer: 'optimizer',
    jsonMapper: 'jsonMapper',
    generateGapReport: 'jsonMapper',
});

workflow.addEdge('jsonMapper', 'gapReporter');
workflow.addEdge('gapReporter', END);

const appGraph = workflow.compile();

// 4. Initialize BullMQ Worker
export const initializeOptimizeResumeWorker = () => {
    const worker = new Worker(
        OPTIMIZE_RESUME_QUEUE_NAME,
        async (job: Job) => {
            const { userId, rawText, resumeId } = job.data;
            console.log(`[Optimize Resume Worker] Starting optimization job ${job.id} for user ${userId}...`);

            const cache = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.RESUME_JOB(job.id!);

            try {
                // Execute the LangGraph workflow
                const finalState = await appGraph.invoke({
                    userId,
                    resumeId,
                    rawText,
                    iterationCount: 0,
                    fabricationLog: [],
                    previousCritiqueFeedback: '',
                    currentResume: '',
                    finalResumeJson: null,
                    gapReport: null,
                    error: null,
                    detectedBranch: '',
                    detectedRole: '',
                    roleCategory: '',
                    contentInventory: {},
                    estimatedCeiling: 100,
                    candidateTier: 'newbie',
                    analyzerOutput: {},
                    previousResume: '',
                    presentationScore: 0,
                    contentScore: 0,
                    improvementDelta: 0,
                    maxIterations: 1,
                    fabricationsFound: false,
                });

                if (!finalState.finalResumeJson) {
                    throw new Error('Failed to generate final resume JSON structure');
                }

                // Render optimized JSON to PDF using React-PDF template
                console.log(`[Optimize Resume Worker] Rendering PDF for resumeId: ${resumeId}...`);
                const pdfBuffer = await renderToBuffer(
                    <ResumeTemplate data={finalState.finalResumeJson as any} />
                );

                // Upload the generated PDF to Cloudinary
                console.log(`[Optimize Resume Worker] Uploading PDF buffer to Cloudinary...`);
                const uploadResult = await uploadBufferToCloudinary(
                    pdfBuffer,
                    'optimized_resumes',
                    'image'
                );

                console.log(`[Optimize Resume Worker] PDF Uploaded: ${uploadResult.secure_url}`);

                // Update the Database with generated content and status
                console.log(`[Optimize Resume Worker] Updating Database for resumeId: ${resumeId}...`);
                await updateResumeRepository(resumeId, {
                    jsonData: {
                        finalResumeJson: finalState.finalResumeJson,
                        gapReport: finalState.gapReport,
                        metrics: {
                            presentationScore: finalState.presentationScore,
                            contentScore: finalState.contentScore,
                            candidateTier: finalState.candidateTier,
                        },
                    },
                    pdfUrl: uploadResult.secure_url,
                    status: 'COMPLETED',
                });

                // Update Redis cache with completed state
                const successResult = {
                    status: 'completed',
                    resumeId,
                    pdfUrl: uploadResult.secure_url,
                    createdAt: new Date().toISOString(),
                };
                await cache.set(cacheKey, JSON.stringify(successResult), 'EX', 3600);
                console.log(`[Optimize Resume Worker] ✅ Job ${job.id} successfully completed`);

            } catch (error: any) {
                console.error(`[Optimize Resume Worker] ❌ Job ${job.id} failed:`, error);

                // Mark database record as failed
                try {
                    await updateResumeRepository(resumeId, { status: 'FAILED' });
                } catch (dbErr) {
                    console.error(`[Optimize Resume Worker] Failed to update DB status to FAILED:`, dbErr);
                }

                // Update Redis cache with failed status
                const errorResult = {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown optimization failure',
                    createdAt: new Date().toISOString(),
                };
                await cache.set(cacheKey, JSON.stringify(errorResult), 'EX', 3600);

                throw error;
            }
        },
        {
            connection: getRedisConnection() as any,
            concurrency: 1, // Gemini rate limits are low, concurrency of 1 is safer
            lockDuration: 120000, // 2 minutes (optimization can take time)
            lockRenewTime: 40000,
        }
    );

    worker.on('failed', (job, err) => {
        console.error(`❌ Optimize Resume job ${job?.id} failed:`, err.message);
    });

    worker.on('completed', (job) => {
        console.log(`✅ Optimize Resume job ${job.id} completed successfully`);
    });

    console.log(`[Optimize Resume Worker] Initialized worker for queue: ${OPTIMIZE_RESUME_QUEUE_NAME}`);
};
