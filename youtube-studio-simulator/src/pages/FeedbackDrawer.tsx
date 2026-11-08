import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ImageIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStudio } from '../store/StudioContext';
import { IconButton, Button } from '../components/common/Button';
import { Checkbox, SelectField } from '../components/common/Controls';
import { timeAgo } from '../lib/format';

const AREAS = ['General', 'Dashboard', 'Content', 'Analytics', 'Community', 'Subtitles', 'Copyright', 'Earn', 'Customisation', 'Audio Library'];

export function FeedbackDrawer() {
  const { feedbackOpen, setFeedbackOpen, addFeedback, feedback, toast } = useStudio();
  const location = useLocation();
  const guess = AREAS.find((a) => location.pathname.toLowerCase().includes(a.toLowerCase().replace(' ', '-'))) ?? 'General';
  const [text, setText] = useState('');
  const [area, setArea] = useState(guess);
  const [screenshot, setScreenshot] = useState(true);
  const [sent, setSent] = useState(false);
  if (!feedbackOpen) return null;
  const close = () => {
    setFeedbackOpen(false);
    setSent(false);
  };
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <aside className="flex h-full w-full max-w-[420px] animate-slide-left flex-col bg-white shadow-dialog">
        <div className="flex h-16 items-center border-b border-black/[0.1] pl-6 pr-3">
          <h2 className="flex-1 text-lg font-medium">Send feedback to YouTube</h2>
          <IconButton label="Close" onClick={close}>
            <X size={22} />
          </IconButton>
        </div>
        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <CheckCircle2 size={56} className="text-[#2ba640]" />
            <div className="mt-4 text-lg font-medium">Thanks for your feedback</div>
            <p className="mt-2 text-sm text-[#606060]">Your feedback has been saved in this simulator. We read every piece of feedback, even if we can't reply to all of it.</p>
            <Button variant="tonal" className="mt-6" onClick={() => setSent(false)}>Send more feedback</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <SelectField label="Feedback about" value={area} onChange={setArea} options={AREAS.map((a) => ({ value: a, label: a }))} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              maxLength={2000}
              placeholder="Tell us what prompted this feedback…"
              className="mt-4 w-full resize-none rounded-lg border border-black/[0.2] p-3 text-sm outline-none focus:border-[#065fd4]"
            />
            <div className="text-right text-xs text-[#606060]">{text.length}/2000</div>
            <p className="mt-1 text-xs leading-5 text-[#606060]">Please don't include any sensitive information.</p>
            <div className="mt-4">
              <Checkbox checked={screenshot} onChange={setScreenshot} label="Include screenshot" />
              {screenshot && (
                <div className="mt-3 flex h-[120px] items-center justify-center rounded-lg border border-dashed border-black/[0.2] bg-[#f9f9f9] text-xs text-[#606060]">
                  <ImageIcon size={18} className="mr-2" /> Screenshot of “{document.title.split(' - ')[0]}”
                </div>
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#909090]">Some account and system information may be sent to Google. This simulator keeps feedback on your device only.</p>
            {feedback.length > 0 && (
              <div className="mt-6 border-t border-black/[0.1] pt-4">
                <div className="mb-2 text-sm font-medium">Your previous feedback</div>
                {feedback.slice(0, 5).map((f) => (
                  <div key={f.at} className="mb-3 rounded-lg bg-[#f9f9f9] p-3 text-[13px]">
                    <div className="text-xs text-[#606060]">{f.area} · {timeAgo(f.at)}</div>
                    <div className="mt-1 line-clamp-3">{f.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!sent && (
          <div className="flex justify-end gap-2 border-t border-black/[0.1] px-6 py-3">
            <Button variant="text" onClick={close}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!text.trim()}
              onClick={() => {
                addFeedback(text.trim(), area);
                setText('');
                setSent(true);
                toast('Feedback sent');
              }}
            >
              Send
            </Button>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
