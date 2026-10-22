import { sanitizeHtml, toHtml } from '../../../utils/richText'
import { RichTextRoot } from './TripDetailsPage.styles'

interface RichTextViewProps {
  content: string
}

function RichTextView({ content }: RichTextViewProps) {
  return <RichTextRoot dangerouslySetInnerHTML={{ __html: sanitizeHtml(toHtml(content)) }} />
}

export default RichTextView