export default function Manual({
  text,
  href,
}: {
  text?: string;
  href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener">
      {text || "この場所の防災マニュアルを見る"}
    </a>
  );
}
