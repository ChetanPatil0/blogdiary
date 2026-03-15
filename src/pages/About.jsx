import { FiFeather, FiUsers, FiZap, FiShield, FiGlobe, FiHeart, FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';

const About = () => {
  const features = [
    {
      icon: FiFeather,
      title: 'Easy Publishing',
      description: 'Write, edit, and publish your posts in minutes with our intuitive editor.'
    },
    {
      icon: FiUsers,
      title: 'Connect Readers',
      description: 'Build your audience and engage with readers who enjoy your content.'
    },
    {
      icon: FiZap,
      title: 'Fast & Reliable',
      description: 'Lightning-fast performance with 99.9% uptime guarantee.'
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your content is protected with enterprise-grade security.'
    },
    {
      icon: FiGlobe,
      title: 'Global Reach',
      description: 'Share your posts with readers from around the world.'
    },
    {
      icon: FiHeart,
      title: 'Community Driven',
      description: 'Join thousands of writers sharing their ideas and knowledge.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Writers' },
    { number: '1M+', label: 'Monthly Readers' },
    { number: '500K+', label: 'Published Posts' }
  ];

  const values = [
    {
      icon: FiTrendingUp,
      title: 'Growth',
      description: 'We help creators grow their audience and increase their reach.'
    },
    {
      icon: FiAward,
      title: 'Excellence',
      description: 'Committed to delivering the best blogging experience possible.'
    },
    {
      icon: FiTarget,
      title: 'Community',
      description: 'Building a supportive network of writers and readers.'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About BlogDiary
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A modern platform for writers to publish content, connect with readers, and build their voice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stat.number}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  BlogDiary empowers writers to share their ideas with the world. Whether you're a blogger, journalist, educator, or passionate creator, our platform provides the tools you need to publish content and connect with an engaged community of readers.
                </p>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  We believe everyone has something valuable to say. Our mission is to make publishing accessible, enjoyable, and rewarding for creators everywhere.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-lg p-6 sm:p-8">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="font-semibold text-blue-600 dark:text-blue-400">"Writing is thinking on paper."</span> We're dedicated to giving every voice a platform to express ideas clearly, authentically, and with impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Our Core Values
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            What drives us every day
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Why Choose BlogDiary?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Discover the features that make us the best choice for writers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">
          Built with Modern Technology
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[
            { name: 'React', desc: 'Fast and responsive UI' },
            { name: 'Node.js', desc: 'Scalable backend infrastructure' },
            { name: 'MongoDB', desc: 'Flexible data management' },
            { name: 'Cloud Hosting', desc: 'Global content delivery' },
            { name: 'Security First', desc: 'Enterprise-grade protection' },
            { name: 'API-Driven', desc: 'Extensible architecture' }
          ].map((tech, idx) => (
            <div key={idx} className="p-5 sm:p-6 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
                {tech.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to Share Your Ideas?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
          Join thousands of writers already publishing on BlogDiary.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/auth/register"
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/blogs"
            className="px-6 sm:px-8 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium text-sm sm:text-base rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Explore Posts
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;