"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal, Loader2, Info, Check } from "lucide-react";
import { useSendAdminMessage } from "@/hooks/admin/useAdminMessages";
import {
  createAdminMessageSchema,
  CreateAdminMessageInput,
  BranchEnum,
  Branch,
} from "@/types/admin/message";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CreateMessageDrawer() {
  const [open, setOpen] = React.useState(false);
  const sendMutation = useSendAdminMessage();

  const form = useForm<CreateAdminMessageInput>({
    resolver: zodResolver(createAdminMessageSchema) as any,
    defaultValues: {
      message: "",
      link: "",
      branches: [],
    },
  });

  const onSubmit = (data: CreateAdminMessageInput) => {
    sendMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  const selectedBranches = form.watch("branches") || [];

  const toggleBranch = (branch: Branch) => {
    const current = [...selectedBranches];
    const index = current.indexOf(branch);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(branch);
    }
    form.setValue("branches", current as any, { shouldValidate: true });
  };

  const selectAllBranches = () => {
    form.setValue("branches", [...BranchEnum] as any, { shouldValidate: true });
  };

  const deselectAllBranches = () => {
    form.setValue("branches", [], { shouldValidate: true });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            className="btn-primary flex items-center gap-2 hover:opacity-95 transition-all duration-300 font-heading text-sm px-5 py-2.5 shadow-button"
            data-testid="broadcast-trigger-btn"
          >
            <SendHorizontal className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            <span>New Broadcast</span>
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg border-l border-border dark:border-[#202020] bg-card text-foreground flex flex-col h-full p-0 overflow-hidden shadow-modal rounded-l-2xl"
      >
        <SheetHeader className="p-6 border-b border-border dark:border-[#202020] shrink-0 bg-background/50 backdrop-blur-md">
          <SheetTitle className="text-xl font-heading font-bold bg-gradient-to-r from-deep-blue to-teal-blue dark:from-white dark:to-steel bg-clip-text text-transparent">
            Broadcast Announcement
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs mt-1">
            Publish announcements instantly. Targeted student cohorts will receive high-priority, beautiful emails compiled asynchronously.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* TARGET BRANCHES */}
              <FormField
                control={form.control}
                name="branches"
                render={() => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold tracking-tight text-foreground">
                        Target Cohorts (Branches)
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllBranches}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <button
                          type="button"
                          onClick={deselectAllBranches}
                          className="text-[10px] font-bold text-muted-foreground hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {BranchEnum.map((branch) => {
                          const isSelected = selectedBranches.includes(branch);
                          return (
                            <button
                              key={branch}
                              type="button"
                              onClick={() => toggleBranch(branch)}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold font-mono tracking-wider transition-all duration-200 hover:scale-[1.02]",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                                  : "border-border dark:border-[#202020] bg-background text-muted-foreground hover:bg-accent/40"
                              )}
                            >
                              <span>{branch}</span>
                              {isSelected && <Check className="size-3 text-primary stroke-[3px]" />}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormDescription className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1">
                      <Info className="size-3.5 mt-0.5 text-teal-blue shrink-0" />
                      Students registered in chosen branches will be added to the high-priority dispatch worker queue.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MESSAGE CONTENT */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold tracking-tight text-foreground">
                      Announcement Body
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type the message body here. Support multi-line information like schedules, dates, and instructions..."
                        className="min-h-36 resize-y bg-background border-border dark:border-[#202020] focus:ring-primary focus:border-primary text-sm rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OPTIONAL CTA LINK */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold tracking-tight text-foreground">
                        Action URL / Resource Link (Optional)
                      </FormLabel>
                      <span className="text-[10px] font-bold text-teal-blue bg-teal-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        Smart CTA
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g. docs.google.com/spreadsheets/..., drive.google.com/..."
                        className="bg-background border-border dark:border-[#202020] focus:ring-primary focus:border-primary text-sm rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px] text-muted-foreground flex items-start gap-1.5 mt-1">
                      <Info className="size-3.5 mt-0.5 text-teal-blue shrink-0" />
                      Links automatically resolve into context labels in students' emails (e.g. &quot;Open Spreadsheet&quot; for Google Sheets). Smart URL auto-prefixes protocol when absent.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBMIT BUTTON CONTAINER */}
              <div className="pt-4 border-t border-border dark:border-[#202020] flex items-center justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={sendMutation.isPending}
                  className="rounded-lg text-xs font-semibold px-4 py-2 border border-transparent hover:bg-muted dark:hover:bg-[#1a1a1a]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="btn-primary flex items-center justify-center gap-2 hover:opacity-95 font-semibold text-xs px-5 py-2.5 shadow-button min-w-32"
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-white" />
                      <span>Queuing...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="size-3.5 text-white" />
                      <span>Dispatch Broadcast</span>
                    </>
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
