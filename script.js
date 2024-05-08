const menuBtn = document.querySelector(".hamburger-menu-button");
const sidebar = document.getElementById("sidebar-section");
const main = document.querySelector(".video-section");
const row = document.querySelector(".video-section");

const api_key = "AIzaSyB61dCiMiNQ0njfW4uUCORhE2P96oQrMs0";
const video_url = "https://www.googleapis.com/youtube/v3/videos?";
const channel_url = "https://www.googleapis.com/youtube/v3/channels?";

menuBtn.addEventListener('click', () => {
  console.log("hello world")
  let myWidth = window.innerWidth;

  if (sidebar.style.transform === "translateX(-100%)") {
      if (myWidth < 1000) {
          main.style.marginLeft = "0";
      } else {
          main.style.marginLeft = "255px";
      }
      sidebar.style.transform = "translateX(0%)";
  }
  else {
      sidebar.style.transform = "translateX(-100%)";
      main.style.marginLeft = "0";
  }
})

async function getVideo() {
  const video = await fetch(video_url + new URLSearchParams({
      key: api_key,
      part: 'snippet, statistics, contentDetails',
      chart: 'mostPopular',
      maxResults: 50,
      regionCode: 'TR'
  }));


  const data = await video.json();
  data.items.forEach(item => {

      // video's date created
      let now = new Date();
      let videoDate = new Date(item.snippet.publishedAt);

      let ms = now - videoDate;
      let second = ms / 1000;
      let minute = second / 60;
      let hour = minute / 60;
      let day = hour / 24;
      let month = day / 30;
      let year = month / 12;

      if (second < 60) {
          item.snippet.publishedAt = `${Math.floor(second)} seconds ago`;
      }
      else if (minute < 60) {
          if (minute < 2) {
              item.snippet.publishedAt = `${Math.floor(minute)} minute ago`;
          }
          else {
              item.snippet.publishedAt = `${Math.floor(minute)} minutes ago`;
          }
      }
      else if (hour < 24) {
          if (hour < 2) {
              item.snippet.publishedAt = `${Math.floor(hour)} hour ago`;
          }
          else {
              item.snippet.publishedAt = `${Math.floor(hour)} hours ago`;
          }
      }
      else if (day < 30) {
          if (day < 2) {
              item.snippet.publishedAt = `${Math.floor(day)} day ago`;
          }
          else {
              item.snippet.publishedAt = `${Math.floor(day)} days ago`;
          }
      }
      else if (month < 12) {
          if (month < 2) {
              item.snippet.publishedAt = `${Math.floor(month)} month ago`;
          }
          else {
              item.snippet.publishedAt = `${Math.floor(month)} months ago`;
          }
      }
      else if (year >= 1) {
          if (year < 2) {
              item.snippet.publishedAt = `${Math.floor(year)} year ago`;
          }
          else {
              item.snippet.publishedAt = `${Math.floor(year)} years ago`;
          }
      }

      // video's view status
      if (item.statistics.viewCount > 999 && item.statistics.viewCount < 1000000) {
          item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3).replace(".", "") + "K";
      }
      else if (item.statistics.viewCount > 1000000 && item.statistics.viewCount < 1000000000) {
          item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3).replace(".0", "") + "M";
      }
      else {
          item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3) + "B"
      }

      // video's duration
      console.log(item.contentDetails.duration)
      item.contentDetails.duration = converTime(item.contentDetails.duration);
      getChannel(item);
  })
}

async function getChannel(video) {
  const channel = await fetch(channel_url + new URLSearchParams({
      key: api_key,
      part: 'snippet',
      id: video.snippet.channelId,
  }));

  const data = await channel.json();
  video.snippet.channelLogo = data.items[0].snippet.thumbnails.default.url;
  createVideo(video);
}

// format video duration str: PT1H43M19S -> 1:43:19
function converTime(time) {
  time = time.search(/PT/i) > -1 ? time.slice(2) : time;
  let h, m, s;

  let hIndex = time.search(/h/i),
      mIndex = time.search(/m/i),
      sIndex = time.search(/s/i);
  
  let timeContainsH = hIndex > -1,
      timeContainsM = mIndex > -1,
      timeContainsS = sIndex > -1;
  
  h = timeContainsH ? time.slice(0, hIndex) + ":" : "";
  m = timeContainsM ? time.slice(timeContainsH ? hIndex + 1 : 0, mIndex) : timeContainsH ? "0" : "0";
  s = timeContainsS ? time.slice(timeContainsM ? mIndex + 1 : hIndex + 1, sIndex) : "0";
  //adding 0 before m or s
  s = (timeContainsM || timeContainsS) && s < 10 ? "0" + s : s;
  m = (timeContainsH || timeContainsM) && m < 10 ? "0" + m + ":" : m + ":";
  return time !== "0S" ? h + m + s : "LIVE"
}

function convertToInternationalCurrencySystem(count) {
  return Math.abs(Number(count)) >= 1.0e+9

      ? (Math.abs(Number(count)) / 1.0e+9).toFixed(3) + "B" : Math.abs(Number(count)) >= 1.0e+6

          ? (Math.abs(Number(count)) / 1.0e+6).toFixed(3) + "M" : Math.abs(Number(count)) >= 1.0e+3

              ? (Math.abs(Number(count)) / 1.0e+3).toFixed(3) + "K" : Math.abs(Number(count));
}
// Video oluşturma
function createVideo(data) {
  const video = `
  <div class="video-container">
    <div class="video-thumbnail">
      <img class="images"
        src="${data.snippet.thumbnails.medium.url}"
        alt="${data.snippet.title}"
      />
      <span class="video-time">${data.contentDetails.duration}</span>
    </div>
    <div class="video_description">
      <div class="channel-container-main">
        <img src="${data.snippet.channelLogo}" alt="${data.snippet.title}" class="channel-main"/>
      </div>
      <div class="video-details">
        <a href="#" class="video-title">${data.snippet.title}</a>
        <a href="#" class="channel-name"> 
          ${data.snippet.channelTitle}
        </a>
        <a href="#"  class="views"> 
          ${data.statistics.Count} 
        </a> 
        <i class="circle-icon">•</i> 
        <a href="#" class="time"> 
          ${data.snippet.publishedAt}
        </a> 
      </div>
    </div>
  </div>
  `;
  const videoGroup = document.createElement("div");
  videoGroup.classList.add("video__group");
  videoGroup.innerHTML += video;

  row.appendChild(videoGroup);

}

getVideo(); 