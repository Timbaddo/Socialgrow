const RULES = [
  { n: "01", title: "Actually Do the Task", body: "Don't submit proof for something you didn't do." },
  { n: "02", title: "Proof Is Required", body: "Your screenshot must clearly show the requested action whenever proof is required." },
  { n: "03", title: "One Task, One Submission", body: "You can't complete the same task repeatedly for extra XP." },
  { n: "04", title: "Keep Comments Genuine", body: "Don't spam or paste meaningless comments everywhere." },
  { n: "05", title: "No Fake Proof", body: "Unrelated, edited, misleading or incorrect screenshots can be rejected." },
  { n: "06", title: "No Bots or Automation", body: "Don't use bots, scripts, fake accounts or automation to manipulate social activity." },
  { n: "07", title: "Admin Review", body: "Proof is reviewed before XP is awarded." },
  { n: "08", title: "No Daily Minimum", body: "Complete tasks whenever you want. There is no minimum number of tasks per day." },
  { n: "09", title: "100 XP Unlocks Your Profile", body: "You need 100 approved XP before you can add your own profile." },
  { n: "10", title: "Respect Platform Rules", body: "Only participate in activities permitted by the relevant social platform." },
];

export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Community Rules</h1>
      <div className="flex flex-col gap-3">
        {RULES.map((r) => (
          <div key={r.n} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
            <span className="text-brand font-extrabold text-sm">{r.n}</span>
            <div>
              <p className="font-semibold text-sm text-slate-900">{r.title}</p>
              <p className="text-sm text-slate-500">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
