import { useState } from "react";
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
import { UserPlus, Mail, Lock, Eye, EyeOff } from "lucide-react";

const createFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

interface AddMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateFormValues) => void;
  isPending: boolean;
}

export function AddMemberDialog({ isOpen, onOpenChange, onSubmit, isPending }: AddMemberDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "ADMIN",
    },
  });

  const handleFormSubmit = (values: CreateFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 shadow-heavy rounded-2xl p-6 dark:shadow-[0_24px_64px_rgba(0,0,0,0.80)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <UserPlus className="size-5 text-primary" /> Add Team Member
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Create and register a new administrative account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          
          {/* Email Address */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@university.edu"
                {...form.register("email")}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 bg-transparent"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs font-bold text-error">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

          {/* Role */}
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
              className="bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-button hover:opacity-90 font-semibold text-xs rounded-md border-none cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
