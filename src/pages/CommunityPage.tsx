const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8x0L7DjiOlt0DiGE34";
const GROUP_URL = "https://chat.whatsapp.com/E7afpZSNz7XJ0IRw098cGV";

export default function CommunityPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24 text-center">
      <div className="text-4xl mb-3">🤝</div>
      <h1 className="text-xl font-bold mb-2">Community</h1>
      <p className="text-sm text-slate-500 mb-6">
        We're building more than just a task platform. Join our WhatsApp community so you can stay
        connected, see important updates, ask questions and interact with other members.
      </p>
      <div className="flex flex-col gap-3">
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3">
          Join WhatsApp Channel
        </a>
        <a href={GROUP_URL} target="_blank" rel="noreferrer"
          className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl py-3">
          Join WhatsApp Group
        </a>
      </div>
    </div>
  );
}
