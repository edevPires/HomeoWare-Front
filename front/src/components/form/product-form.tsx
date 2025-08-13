import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "./text-input";
import { SelectInput } from "./select-input";
import type { SelectOption } from "./select-input";

const productSchema = z
  .object({
    identificador: z.string().min(1, "Informe o identificador"),
    name: z.string().min(1, "Informe o nome"),
    categoria: z.string().min(1, "Selecione uma categoria"),
    estoqueInicial: z.coerce
      .number()
      .refine((n) => !Number.isNaN(n), "Informe um número")
      .nonnegative("Não pode ser negativo"),
    limiteAlerta: z.coerce
      .number()
      .refine((n) => !Number.isNaN(n), "Informe um número")
      .nonnegative("Não pode ser negativo"),
  })
  .refine((data) => data.limiteAlerta <= data.estoqueInicial, {
    path: ["limiteAlerta"],
    message: "Limite deve ser menor ou igual ao estoque",
  });

export type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  defaultValues?: Partial<ProductFormValues>;
  categoriaOptions: SelectOption[];
  submitting?: boolean;
};

export function ProductForm({
  onSubmit,
  defaultValues,
  categoriaOptions,
  submitting,
}: ProductFormProps) {
  const initValues = useMemo<Partial<ProductFormValues>>(() => {
    const base: Partial<ProductFormValues> = {
      identificador: defaultValues?.identificador ?? "",
      name: defaultValues?.name ?? "",
      categoria: defaultValues?.categoria ?? "",
    };
    if (typeof defaultValues?.estoqueInicial === "number")
      base.estoqueInicial = defaultValues.estoqueInicial;
    if (typeof defaultValues?.limiteAlerta === "number")
      base.limiteAlerta = defaultValues.limiteAlerta;
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
          const { ref, onChange, onBlur } = register("identificador");
          return (
            <TextInput
              label="Identificador"
              name="identificador"
              placeholder="Ex.: PROD-001"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.identificador?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("name");
          return (
            <TextInput
              label="Nome"
              name="name"
              placeholder="Ex.: Tintura Arnica 30CH"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.name?.message as string | undefined}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("categoria");
          return (
            <SelectInput
              label="Categoria"
              name="categoria"
              options={categoriaOptions}
              placeholder="Selecione..."
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.categoria?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("estoqueInicial", {
            valueAsNumber: true,
          });
          return (
            <TextInput
              label="Estoque Inicial"
              name="estoqueInicial"
              type="number"
              inputMode="numeric"
              placeholder="0"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.estoqueInicial?.message}
            />
          );
        })()}

        {(() => {
          const { ref, onChange, onBlur } = register("limiteAlerta", {
            valueAsNumber: true,
          });
          return (
            <TextInput
              label="Limite Alerta"
              name="limiteAlerta"
              type="number"
              inputMode="numeric"
              placeholder="0"
              fullWidth
              ref={ref}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.limiteAlerta?.message}
            />
          );
        })()}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-primary text-dark font-bold disabled:opacity-60"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
