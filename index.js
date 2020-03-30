const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

const Sentiment = require('sentiment');
const { getTweetsBySearch } = require('./TwitterApi');
const sentiment = new Sentiment();

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const analyzeTweets = async (searchString, socket) => {
  const tweets = await getTweetsBySearch(searchString, socket);
  if (!tweets) return;
  const sentimentResults = [];
  Array.from(tweets).forEach((tweet, id) => {
    const formattedTweet = tweet.replace(/https:\/\/t.co\/\w+/g, '');
    const result = sentiment.analyze(formattedTweet);
    sentimentResults.push({ id, tweet: formattedTweet, ...result });
  });

  const totalSentimentResult = sentimentResults.reduce(
    (result, tweet) => {
      result.score += tweet.score;
      result.comparative += tweet.comparative;
      if (tweet.score > 0) result.positive++;
      if (tweet.score === 0) result.neutral++;
      if (tweet.score < 0) result.negative++;
      return result;
    },
    { score: 0, comparative: 0, positive: 0, neutral: 0, negative: 0 }
  );

  totalSentimentResult.score = (totalSentimentResult.score / sentimentResults.length).toFixed(3);
  totalSentimentResult.comparative = (
    totalSentimentResult.comparative / sentimentResults.length
  ).toFixed(3);
  totalSentimentResult.count = sentimentResults.length;

  return { sentimentResults, totalSentimentResult };
};

io.on('connection', socket => {
  socket.on('search', async searchString => {
    const result = await analyzeTweets(searchString, socket);
    if (result) {
      socket.emit('status', {
        message: `Done! Analyzed ${result.totalSentimentResult.count} tweets.`,
        done: true,
        error: false
      });
      socket.emit('analyzeResult', result);
    }
  });
});
