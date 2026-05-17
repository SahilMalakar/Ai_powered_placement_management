import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";

const reactivateFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

type ReactivateFormValues = z.infer<typeof reactivateFormSchema>;

interface ReactivateMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ReactivateFormValues) => void;
  isPending: boolean;
  memberEmail: string;
  memberRole: "ADMIN" | "SUPER_ADMIN";
}

export function ReactivateMemberDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  memberEmail,
  memberRole,
}: ReactivateMemberDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<ReactivateFormValues>({
    resolver: zodResolver(reactivateFormSchema),
    defaultValues: {
      password: "",
      role: memberRole,
    },
  });

  // Sync initial inputs when selected member role details change
  useEffect(() => {
    if (isOpen) {
      form.reset({
        password: "",
        role: memberRole,
      });
    }
  }, [isOpen, memberRole, form]);

  const handleFormSubmit = (values: ReactivateFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 shadow-heavy rounded-2xl p-6 dark:shadow-[0_24px_64px_rgba(0,0,0,0.80)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold text-[#1D9E75] flex items-center gap-2">
            <RefreshCw className="size-5 text-[#1D9E75]" /> Reactivate Member
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Restoring account access for: <span className="font-mono text-foreground font-semibold break-all">{memberEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          
          {/* Optional New Password */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">New Password</label>
              <span className="text-[10px] text-mist font-bold uppercase">Optional</span>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep old password"
                {...form.register("password")}
                className="w-full pl-9 pr-10 py-2 border border-input rounded-md text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs font-bold text-error">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Role selection dropdown */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">System Role</label>
            <select
              {...form.register("role")}
              className="w-full p-2 border border-input rounded-md text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 bg-transparent dark:bg-[#141414]"
            >
              <option value="ADMIN">Administrator (ADMIN)</option>
              <option value="SUPER_ADMIN">Super Administrator (SUPER_ADMIN)</option>
            </select>
          </div>

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
              type="submit"
              className="bg-[#1D9E75] hover:bg-[#1D9E75]/95 text-white shadow-subtle font-bold text-xs rounded-md border-none cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Restoring..." : "Restore Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
