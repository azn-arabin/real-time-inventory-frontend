import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button as UiButton } from "@/components/ui/button";
import { Button } from "@/components/common/Buttons";
import { FormInputWithLabel } from "@/components/form/FormComponents";
import { dropsApi } from "@/services/api";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type CreateDropForm = {
  name: string;
  price: number;
  totalStock: number;
  imageUrl?: string;
};

interface Props {
  onCreated: () => void;
}

export function CreateDropModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDropForm>();

  const onSubmit = async (data: CreateDropForm) => {
    setLoading(true);
    try {
      await dropsApi.createDrop({
        ...data,
        price: Number(data.price),
        totalStock: Number(data.totalStock),
      });
      onCreated();
      reset();
      setOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to create drop";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <UiButton size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Drop
        </UiButton>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new drop</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormInputWithLabel
            name="name"
            label="Sneaker name"
            placeholder="e.g. Air Max 97 OG"
            register={register}
            error={errors.name}
            validators={{ required: "Name is required" }}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInputWithLabel
              name="price"
              label="Price ($)"
              type="number"
              placeholder="199.99"
              step="0.01"
              min="0"
              register={register}
              error={errors.price}
              validators={{ required: "Price is required", min: { value: 0, message: "Must be positive" } }}
            />

            <FormInputWithLabel
              name="totalStock"
              label="Stock qty"
              type="number"
              placeholder="100"
              min="1"
              register={register}
              error={errors.totalStock}
              validators={{ required: "Stock is required", min: { value: 1, message: "At least 1" } }}
            />
          </div>

          <FormInputWithLabel
            name="imageUrl"
            label="Image URL (optional)"
            placeholder="https://..."
            register={register}
            error={errors.imageUrl}
          />

          <div className="flex gap-2 justify-end pt-2">
            <UiButton
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </UiButton>
            <Button type="submit" loading={loading}>
              Create Drop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
