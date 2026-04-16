export default function TitleHeader({ title }: { title: string }) {
  return (
    <h2 className="text-center mb-1 font-bold text-3xl bg-gray-200 px-4 py-3 rounded-md shadow-md">
      {title}
    </h2>
  );
}
