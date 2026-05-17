import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeactivateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  memberEmail: string;
}

export function ConfirmDeactivateDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  memberEmail,
}: ConfirmDeactivateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 shadow-heavy rounded-2xl p-6 dark:shadow-[0_24px_64px_rgba(0,0,0,0.80)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold text-error flex items-center gap-2">
            <AlertTriangle className="size-5" /> Deactivate Administrator?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Are you sure you want to deactivate <span className="font-mono text-foreground font-semibold break-all">{memberEmail}</span>? 
            This will immediately revoke their administrative dashboard session and prevent them from signing in.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-border/20 -mx-6 -mb-6 p-4 bg-muted/30">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold rounded-md cursor-pointer border border-input hover:bg-accent/40 bg-transparent"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            className="bg-error hover:opacity-90 text-white font-bold text-xs rounded-md border-none cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Deactivating..." : "Confirm Deactivation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
