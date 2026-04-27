interface PreviewProps {
  html: string;
}

export function Preview({ html }: PreviewProps) {
  return <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />;
}
