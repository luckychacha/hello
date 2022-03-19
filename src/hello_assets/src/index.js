import { hello, createActor, canisterId as my_id } from "../../declarations/hello";

const authors = {}

function time_format(timestamp) {
  var date = new Date(Number(timestamp));
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  let D = date.getDate() + ' ';
  let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(); 
  return Y+M+D+h+m+s;
}

async function post() {
  let post = document.getElementById("post")
  let error = document.getElementById("error");
  error.innerText = ""
  post.disabled = true;
  let content = document.getElementById("message")
  let otp = document.getElementById("otp")
  if (content.value.trim().length == 0) {
    // console.log(content.value)
    // console.log("empty content")
  } else {
    try {
      await hello.post(otp.value, content.value);
      content.value = ""
      otp.value = ""
    } catch (err) {
      console.log(`err:${err}`);
      error.innerText = "Post error!";
    }
  }
  post.disabled = false;
}
var tmp_name = "";
async function load_author_name() {
  let author_name = await hello.get_name()
  // console.log(`current author name is: ${author_name}`)
  if (tmp_name != author_name[0]) {
    authors[my_id] = author_name ? author_name[0] : my_id;
    // console.log(authors)
    tmp_name = authors[my_id]
    document.getElementById("current_author_name").innerText = author_name[0]
  }
}

async function load_my_follows() {
  let follows = await hello.follows();
  // console.log("follows");
  // console.log(follows)
  let follow_section = document.getElementById("follows");
  follow_section.replaceChildren([])
  for (var i = 0; i < follows.length; i++) {
    let follow_item = document.createElement("p")
    // if (follows[i].message.trim().length == 0) {
    //   continue;
    // }
    // console.log(follows[i].toString());
    // get tmp_canister_id and tmp_name
    // save it into authors.
    let tmp_canister_id = follows[i].toString();
    let tmp_name = await createActor(tmp_canister_id).get_name()
    follow_item.setAttribute("name", "follow");
    follow_item.setAttribute("canister_id", tmp_canister_id);
    follow_item.setAttribute("author_name", tmp_name);
    follow_item.innerText = tmp_name && tmp_name[0] ? tmp_name[0] : tmp_canister_id
    authors[tmp_canister_id] = tmp_name && tmp_name[0] ? tmp_name[0] : tmp_canister_id
    follow_section.append(follow_item)
  }
  document.getElementsByName("follow").forEach(element => {
    
    element.onclick = async () => {
      let author_name = element.getAttribute("author_name") 
      let canister_id = element.getAttribute("canister_id")
      // console.log(a + "::" + b);

      document.getElementById("chosen_follow_posts").replaceChildren([]);
      let tmp_posts = await createActor(canister_id).posts(100);
      for (var i = 0; i < tmp_posts.length; i++) {
        let tmp_p = document.createElement("p");
        let time = time_format(tmp_posts[i].time.toString().substring(0, 13));
        let tmp = `   *****   \r\nTime: ${time},\r\nAuthor Name: ${author_name},\r\nAuthor Canister ID: ${canister_id},\r\nMessage: ${tmp_posts[i].text}`;
        tmp_p.innerText = tmp;
        document.getElementById("chosen_follow_posts").append(tmp_p);
      }
      
    }
  })
}

async function load_my_timeline() {
  let timeline = await hello.timeline(100);
  // console.log("timeline");
  // console.log(timeline)
  let timeline_section = document.getElementById("timeline");
  timeline_section.replaceChildren([])
  for (var i = 0; i < timeline.length; i++) {
    let timeline_item = document.createElement("p")
    let time = time_format(timeline[i].time.toString().substring(0, 13));
    // let tmp_name = await createActor(timeline[i].author).get_name()
    let tmp = `   *****   \r\nTime: ${time},\r\nAuthor Name: ${timeline[i].author},\r\nMessage: ${timeline[i].text}`;
    timeline_item.innerText = tmp
    timeline_section.append(timeline_item)
  }
}

async function submit_author_name() {
  let author_name = document.getElementById("author_name")
  // console.log(author_name.value);
  let button = document.getElementById("submit_author_name")
  button.disabled = true;
  if (author_name.value.trim().length == 0) {
    author_name.value = ""
    // console.log("empty author name");
    return;
  }
  try {
    await hello.set_name(author_name.value);
    // console.log("success:", author_name.value)
    author_name.value = ""
    load_author_name()
  } catch (err) {
    // console.log(`author_name err:${err}`);
  }
  author_name.value = ""
  button.disabled = false;
}

var num_posts = -1;

async function load_posts() {
  let posts_section = document.getElementById("posts")
  if (num_posts < 0) {
    // init
    num_posts = posts_section.children.length
  }
  let posts = await hello.posts(100)
  // console.log(posts)
  if (posts.length == num_posts) {
    return
  }
  posts_section.replaceChildren([])
  num_posts = posts.length;
  for (var i = 0; i < posts.length; i++) {
    let post_item = document.createElement("p")
    if (posts[i].text.trim().length == 0) {
      continue;
    }
    post_item.innerText = posts[i].text
    posts_section.append(post_item)
  }
}

function load_posts_by_id(canister_id) {
  let posts_section = document.getElementById("other_posts")
  posts_section.replaceChildren([])
  let posts = createActor(canister_id).posts;
  for (var i = 0; i < posts.length; i++) {
    let post_item = document.createElement("p")
    if (posts[i].text.trim().length == 0) {
      continue;
    }
    post_item.innerText = posts[i].text
    posts_section.append(post_item)
  }
}

function load() {
  let post_button = document.getElementById("post");
  post_button.onclick = post;
  let submit_author_name_button = document.getElementById("submit_author_name");
  submit_author_name_button.onclick = submit_author_name;
  load_posts();
  load_author_name();
  load_my_follows();
  load_my_timeline();
  document.getElementById("refresh_my_folows").onclick = load_my_follows;
  document.getElementById("refresh_timeline").onclick = load_my_timeline;
  // document.getElementById("refresh_author_name").onclick = load_author_name;
  setInterval(
    load_posts,
    3000
  )
  // setInterval(
  //   load_author_name,
  //   3000
  // )
}
window.load = load()

