const GITHUB_API_URL = 'https://api.github.com';

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        if (rateLimitRemaining === '0') {
          const resetDate = new Date(rateLimitReset * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}. Please set GITHUB_TOKEN environment variable.`);
        }
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function fetchUserLanguages(username) {
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_URL}/users/${username}/repos?page=${page}&per_page=${perPage}&type=owner`;
    const pageRepos = await fetchWithRetry(url, { headers });

    if (pageRepos.length === 0) break;
    repos.push(...pageRepos);

    if (pageRepos.length < perPage) break;
    page++;
  }

  const languageStats = {};
  let totalBytes = 0;

  for (const repo of repos) {
    if (repo.fork) continue;

    const languagesUrl = `${GITHUB_API_URL}/repos/${username}/${repo.name}/languages`;
    const languages = await fetchWithRetry(languagesUrl, { headers });

    const allBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

    for (const [language, bytes] of Object.entries(languages)) {
      console.log(`Processing ${repo.name} - ${language}: ${bytes} bytes`);
      languageStats[language] = (languageStats[language] || 0) + Math.floor((bytes / allBytes) * 100);
      totalBytes += Math.floor((bytes / allBytes) * 100);
    }
  }

  const languagePercentages = {};
  for (const [language, bytes] of Object.entries(languageStats)) {
    const percentage = (bytes / totalBytes) * 100;
    languagePercentages[language] = {
      percentage: percentage.toFixed(1),
      bytes
    };
  }

  const sortedLanguages = Object.entries(languagePercentages)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .reduce((acc, [lang, data]) => {
      acc[lang] = data;
      return acc;
    }, {});

  return sortedLanguages;
}