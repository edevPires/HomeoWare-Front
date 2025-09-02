import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "./text-input";
import { Trash2 } from "lucide-react";

const productSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  preco: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), "Informe um número válido")
    .positive("O preço deve ser maior que zero"),
  estoque: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), "Informe um número válido")
    .nonnegative("Não pode ser negativo"),
  ncm: z.string().min(1, "Informe o NCM"),
  observacao: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  defaultValues?: Partial<ProductFormValues>;
  submitting?: boolean;
  onDelete?: () => void | Promise<void>;
  deleting?: boolean;
};

export function ProductForm({
  onSubmit,
  defaultValues,
  submitting,
  onDelete,
  deleting,
}: ProductFormProps) {
  const initValues = useMemo<Partial<ProductFormValues>>(() => {
    const base: Partial<ProductFormValues> = {
      nome: defaultValues?.nome ?? "",
      ncm: defaultValues?.ncm ?? "",
      observacao: defaultValues?.observacao ?? "",
    };
    if (typeof defaultValues?.preco === "number")
      base.preco = defaultValues.preco;
    if (typeof defaultValues?.estoque === "number")
      base.estoque = defaultValues.estoque;
    return base;
  }, [defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<
      ProductFormValues,
      any,
      ProductFormValues
    >,
    defaultValues: initValues as any,
    mode: "onBlur",
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-[25rem]"
    >
      <div className="grid grid-cols-1 gap-4">
        {(() => {
          const { ref, onChange, onBlur } = register("nome");
          return (
            <TextInput
              label="Nome"
              name="nome"
              placeholder="Ex.: Tintura Arnica 30CH"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.nome?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("preco", {
            valueAsNumber: true,
          });
          return (
            <TextInput
              label="Preço"
              name="preco"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.preco?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("estoque", {
            valueAsNumber: true,
          });
          return (
            <TextInput
              label="Estoque"
              name="estoque"
              type="number"
              inputMode="numeric"
              placeholder="0"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.estoque?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("ncm");
          return (
            <TextInput
              label="NCM"
              name="ncm"
              placeholder="Ex.: 3004.90.99"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.ncm?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("observacao");
          return (
            <div className="grid gap-2">
              <label className="text-sm text-font/80">Observação</label>
              <textarea
                {...{ ref, onChange, onBlur }}
                name="observacao"
                placeholder="Observações adicionais sobre o produto..."
                className="min-h-[80px] px-3 py-2 rounded-lg bg-input border border-input-border text-font placeholder:text-font/50 resize-vertical"
                rows={3}
              />
              {errors.observacao && (
                <span className="text-xs text-red-400">
                  {errors.observacao.message}
                </span>
              )}
            </div>
          );
        })()}
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Delete button - only show when editing */}
        {defaultValues && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting || submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-60 transition-colors"
          >
            {deleting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Excluir
              </>
            )}
          </button>
        )}
        
        {/* Save button */}
        <button
          type="submit"
          disabled={submitting || deleting}
          className="px-4 py-2 rounded-lg bg-primary text-contrast font-bold disabled:opacity-60 transition-colors"
        >
          {submitting ? "Salvando..." : defaultValues ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
