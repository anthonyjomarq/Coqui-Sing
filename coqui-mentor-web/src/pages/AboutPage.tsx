import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            About Coqui Sing
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">The Story</h2>
              <p className="text-lg leading-relaxed">
                Hello, I'm a full-stack programmer currently taking singing classes.
                I've always wanted to be more articulate and learn how to sing properly.
                Growing up in Puerto Rico, I was surrounded by a rich music culture that
                inspired me to pursue vocal training.
              </p>
              <p className="text-lg leading-relaxed">
                Puerto Rico has an incredible musical heritage, and I want to represent
                that legacy. This project combines my passion for technology with my
                journey in music.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">Why "Coqui"?</h2>
              <p className="text-lg leading-relaxed">
                The name comes from the Coquí, a small frog native to Puerto Rico.
                Every night, you can hear them singing their distinctive "co-kee" call
                throughout the island. The Coquí is a symbol of Puerto Rican identity
                and pride.
              </p>
              <p className="text-lg leading-relaxed">
                Just like the Coquí sings at night, this app helps people find and
                develop their own voice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">The Technology</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">Frontend</h3>
                  <ul className="text-sm space-y-1">
                    <li>React with TypeScript</li>
                    <li>Redux for state management</li>
                    <li>Web Audio API for recording</li>
                    <li>Custom pitch detection algorithm</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">Features</h3>
                  <ul className="text-sm space-y-1">
                    <li>Real-time pitch detection</li>
                    <li>Audio visualization</li>
                    <li>Recording and playback</li>
                    <li>Progress tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">Open Source</h2>
              <p className="text-lg leading-relaxed">
                This project is open source and available on GitHub. Feel free to
                explore the code, suggest improvements, or use it for your own learning.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://github.com/anthonyjomarq/Coqui-Sing.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  View on GitHub
                </a>
                <Link
                  to="/"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Try the App
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
