import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Loading from './ui/Loading';

function Threads() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    sentimentOverTime: [],
    sentimentDistribution: [],
    recentPosts: [],
    totalPosts: 0,
    avgComments: 0,
    avgLikes: 0,
    avgRetweets: 0,
    verifiedProportion: 0,
  });
  const [prevTotalPosts, setPrevTotalPosts] = useState(0);
  const [showNewPostsMessage, setShowNewPostsMessage] = useState(false);

  const loadingStates = [
    { text: 'Connecting to server...' },
    { text: 'Fetching posts...' },
    { text: 'Analyzing sentiments...' },
    { text: 'Preparing dashboard...' },
  ];

  const fetchData = () => {
    fetch('http://127.0.0.1:8000/threads')
      .then(response => response.json())
      .then(data => {
        const { results, metrics } = data;
        const totalPosts = results.length;

        if (totalPosts > prevTotalPosts && prevTotalPosts !== 0) {
          setShowNewPostsMessage(true);
          setTimeout(() => setShowNewPostsMessage(false), 5000);
        }
        setPrevTotalPosts(totalPosts);

        const sentimentOverTime = metrics.sentiment_trends.time_periods.map((period, index) => ({
          period,
          positive: metrics.sentiment_trends.positive[index],
          neutral: metrics.sentiment_trends.neutral[index],
          negative: metrics.sentiment_trends.negative[index],
        }));

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

        const recentPosts = results.slice(-5).reverse().map((item, index) => ({
          id: `post${index + 1}`,
          content: item.text,
          sentiment: item.predicted_label.charAt(0).toUpperCase() + item.predicted_label.slice(1),
          date: new Date(item.published_on).toLocaleDateString(),
          likes: item.like_count || 0,
          reposts: item.retweet_count || 0,
          comments: item.comment_count || 0,
        }));

        setDashboardData({
          sentimentOverTime,
          sentimentDistribution,
          recentPosts,
          totalPosts,
          avgComments: metrics.averages.avg_comments,
          avgLikes: metrics.averages.avg_likes,
          avgRetweets: metrics.averages.avg_retweets,
          verifiedProportion: metrics.verified_proportion,
        });
      })
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
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
                <MetricCard title="Total Posts" value={dashboardData.totalPosts.toLocaleString()} />
                <MetricCard title="Total Keywords" value="83" />
                <MetricCard title="Avg Comments" value={dashboardData.avgComments.toLocaleString()} />
                <MetricCard title="Avg Likes" value={dashboardData.avgLikes.toLocaleString()} />
                <MetricCard title="Avg Reposts" value={dashboardData.avgRetweets.toLocaleString()} />
                <MetricCard title="Percent Verified" value={`${dashboardData.verifiedProportion}%`} />
                <MetricCard title="Time Range" value="2023-2025" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sentiment Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.sentimentOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
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
                    <BarChart data={dashboardData.sentimentDistribution}>
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
                <div className="p-4 border-b dark:border-gray-700 flex items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
                  {showNewPostsMessage && (
                    <span className="ml-2 text-green-600 text-sm font-medium">New Posts Found!</span>
                  )}
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
                      {dashboardData.recentPosts.map((post) => (
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

function MetricCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default Threads;