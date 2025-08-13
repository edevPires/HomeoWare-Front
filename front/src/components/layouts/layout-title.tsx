export const LayoutTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <h1 className="text-font text-3xl font-bold text-start">
      {title} <span className="text-primary">{subtitle}</span>
    </h1>
  );
};
