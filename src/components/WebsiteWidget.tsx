import { useState } from "react";

const WHATSAPP_MSG = encodeURIComponent(
  "Hello Heis Timo Tech, I found you through SocialGrow and I'm interested in getting a website. I'd like to discuss my project."
);

export function WebsiteWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-slate-900 text-white text-xs font-semibold px-2 py-3 rounded-l-lg shadow-lg [writing-mode:vertical-rl] hover:bg-slate-800"
      >
        Need a Website?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 animate-popIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Need a Website? 🌐</h3>
            <p className="text-sm text-slate-600 mb-3">
              Want a professional website for your business, personal brand, portfolio or project?
            </p>
            <p className="text-sm font-semibold text-slate-800 mb-1">Contact Heis Timo Tech</p>
            <p className="text-sm text-slate-500 mb-5">
              Modern, mobile-friendly websites built around your needs.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/2349162539689?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noreferrer"
                className="text-center bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-2.5"
              >
                Contact on WhatsApp
              </a>
              <a
                href="mailto:timothydabere@gmail.com?subject=Website%20Inquiry%20from%20SocialGrow"
                className="text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl py-2.5"
              >
                Send Email
              </a>
            </div>
            <button onClick={() => setOpen(false)} className="mt-4 text-sm text-slate-400 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
