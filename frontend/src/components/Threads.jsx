import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiMoon, FiSun } from 'react-icons/fi';
import Loading from './ui/Loading';
import { SocialIcon } from 'react-social-icons';

function Threads() {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState({
    sentimentOverTime: [],
    sentimentDistribution: [],
    recentPosts: [],
    totalPosts: 0,
  });

  const loadingStates = [
    { text: 'Connecting to server...' },
    { text: 'Fetching posts...' },
    { text: 'Analyzing sentiments...' },
    { text: 'Preparing dashboard...' },
  ];

  useEffect(() => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/posts')
      .then(response => response.json())
      .then(data => {
        const results = data.results;

        const totalPosts = results.length;

        const sentimentOverTime = [];
        const chunkSize = Math.ceil(results.length / 12);
        for (let i = 0; i < 12 && i * chunkSize < results.length; i++) {
          const chunk = results.slice(i * chunkSize, (i + 1) * chunkSize);
          const counts = chunk.reduce(
            (acc, item) => {
              acc[item.predicted_label] = (acc[item.predicted_label] || 0) + 1;
              return acc;
            },
            { positive: 0, neutral: 0, negative: 0 }
          );
          sentimentOverTime.push({
            month: `Month ${i + 1}`,
            positive: counts.positive,
            neutral: counts.neutral,
            negative: counts.negative,
          });
        }

        const distributionCounts = results.reduce(
          (acc, item) => {
            acc[item.predicted_label] = (acc[item.predicted_label] || 0) + 1;
            return acc;
          },
          { positive: 0, neutral: 0, negative: 0 }
        );
        const sentimentDistribution = [
          { name: 'Positive', value: distributionCounts.positive },
          { name: 'Neutral', value: distributionCounts.neutral },
          { name: 'Negative', value: distributionCounts.negative },
        ];

        const recentPosts = results.slice(-5).map((item, index) => ({
          id: `post${index + 1}`,
          content: item.text,
          sentiment: item.predicted_label.charAt(0).toUpperCase() + item.predicted_label.slice(1),
          date: new Date(Date.now() - index * 86400000).toLocaleDateString(),
          likes: Math.floor(Math.random() * 1000),
          reposts: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 200),
        }));

        setSentimentData({
          sentimentOverTime,
          sentimentDistribution,
          recentPosts,
          totalPosts,
        });
      })
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading && <Loading loadingStates={loadingStates} duration={1000} loop={true} />}
      {!loading && (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <header className="p-4 border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instagram Threads</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Jeremy Moon</p>
              </div>
            </div>
          </header>

          <main className="p-4">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Posts" value={sentimentData.totalPosts.toLocaleString()} change="+14%" />
                <MetricCard title="Total Keywords" value="83" />
                <MetricCard title="Time Range" value="30 Days" />
                <MetricCard title="Percent Verified" value="78.5%" change="+43%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sentiment Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentData.sentimentOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#10B981" />
                      <Line type="monotone" dataKey="neutral" stroke="#6B7280" />
                      <Line type="monotone" dataKey="negative" stroke="#EF4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sentiment Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sentimentData.sentimentDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Content</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Sentiment</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sentimentData.recentPosts.map((post) => (
                        <tr key={post.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{post.content}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                              ${post.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                              post.sentiment === 'Neutral' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'}`}>
                              {post.sentiment}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{post.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                            {`${post.likes} likes • ${post.reposts} reposts • ${post.comments} comments`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

function MetricCard({ title, value, change }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {change && <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">{change}</span>}
      </div>
    </div>
  );
}

export default Threads;