const Base_URL = "https://user-list.alphacamp.io/";
const INDEX_URL = Base_URL + "api/v1/users";
const userPanel = document.querySelector("#user-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let users = [];
let filteredUser = [];
const friendsList = JSON.parse(localStorage.getItem("myFriendsList")) || [];
const USERS_PER_PSGE = 24;
const paginator = document.querySelector("#paginator");
const navbar = document.querySelector("#navbar");
let currentData = users;

//根據頁數擷取使用者
function getUsersByPage(page) {
  // console.log(currentData);
  const data = filteredUser.length ? filteredUser : currentData;
  const startIndex = (page-1) * USERS_PER_PSGE;
  return data.slice(startIndex, startIndex + USERS_PER_PSGE)
}

//渲染分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount/USERS_PER_PSGE);
  let rawHTML ='';
  for (let num = 1; num<=numberOfPages; num++) {
    rawHTML +=`
    <li class="page-item" data-page=${num}><a class="page-link" href="#" data-page=${num}>${num}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}

//渲染使用者清單
function renderUsers(data) {
  let rawHTML = '';
  
  for (let user of data) {
    let btnColorClass = "btn-info";
    let btnText = "+ add friend";
    
    //若用戶已加入好友清單，調整按鈕狀態
    if (friendsList.some(friend => friend.id === user.id) ) {
      btnColorClass = "btn-secondary";
      btnText = "- remove friend";
    }
    
    rawHTML += `<div class="card mx-2 my-2 text-center" style="width: 12rem;">
        <img src="${user.avatar}" class="card-img-top">
        <div class="card-body d-flex flex-wrap flex-column align-items-center justify-content-between">
        <a tabindex="0" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-html="true" title="${user.name} ${user.surname}" data-bs-content="Gender: ${user.gender} <br>
        Birthday: ${user.birthday}<br>
        Region: ${user.region}<br>
        Email: ${user.email}">
          <h5 class="card-title " style="fontSize:20px">${user.name} ${user.surname}</h5>
        </a>
          <a href="javascript:;" class="btn ${btnColorClass} align-items-end friend-ststus-btn" style="height:36px;" data-id="${user.id}">${btnText}</a>
           
        </div>
      </div>`
  }
  userPanel.innerHTML = rawHTML;

  // Initialize popover
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.forEach(function (popoverTriggerEl) {
      new bootstrap.Popover(popoverTriggerEl,);
    });
  
}

//利用toggle()判斷朋友狀態
function btnChange(button) {
  const isInfo = button.classList.toggle("btn-info");
  if(isInfo) {
    button.classList.remove("btn-secondary");
    button.innerText = "+ add friend";
  }else {
    button.classList.add("btn-secondary");
    button.innerText = "- remove friend";
  }
}

//加入好友
function addFriend(id) {
  const friend = users.find(user => user.id === id);
  if(friendsList.some(friend => friend.id === id)) return;
  friendsList.push(friend);
  localStorage.setItem('myFriendsList',JSON.stringify(friendsList));
  
}
//移除好友
function removeFriend(id) {
  const friend = friendsList.find(user => user.id === id);
  const removedFriendIndex = friendsList.indexOf(friend);
  if(!friendsList.some(friend => friend.id === id)) return;
  friendsList.splice(removedFriendIndex,1);
  localStorage.setItem('myFriendsList',JSON.stringify(friendsList));
  
}

//搜尋關鍵字綁定監聽器
searchForm.addEventListener('submit',function searchFormSubmitted(event) {
  event.preventDefault();
  const keywords = searchInput.value.trim().toLowerCase();
  
  // 若沒有輸入關鍵字就點搜尋按鈕 跳出提示
  if (!keywords.length) {
    return alert('請輸入有效字串')
  }
  
  // 找出符合keyword 的 user
  filteredUser = users.filter( (user) => 
    user.name.toLowerCase().includes(keywords) || user.surname.toLowerCase().includes(keywords));         
  
  //當沒有資料時顯示字串
  if(!filteredUser.length) {
    userPanel.innerHTML='<h5>查無符合條件的資料</h5>'
  }else { 
    renderPaginator(filteredUser.length);
    renderUsers(getUsersByPage(1));
  }
  })

//朋友狀態按鈕綁定監聽器
userPanel.addEventListener('click', function onAddFriendClick(event) {
  if (event.target.matches('.friend-ststus-btn')){
    const userId = Number(event.target.dataset.id);
    if (friendsList.some(friend => friend.id === userId)) {
      removeFriend(userId);
      btnChange(event.target);
      console.log (`id:${userId} be removed`)
    }else {
      addFriend(userId);
      btnChange(event.target);
      console.log (`id:${userId} be added`)
    }
  }
})

function activePageNum(num) {
  const pageNumList = document.querySelectorAll("#paginator li")
  pageNumList.forEach(element => {
    if(element.classList.contains("active")) {
      element.classList.remove("active")
    }
  })
  num.parentElement.classList.add("active");
}


//分頁器綁定監聽器
paginator.addEventListener('click', function onPageClicked(event) {
  if(event.target.matches('.page-link')) {
    const page = Number(event.target.dataset.page);
    renderUsers(getUsersByPage(page));
    activePageNum(event.target);
    }
})

//切換頁面綁定監聽器
navbar.addEventListener('click', event => {
  if (event.target.matches('#my-friend')) {
    filteredUser = []; // 清空過濾的用戶
    currentData = friendsList; //改變資料來源
    // console.log(currentData);
    renderPaginator(currentData.length);
    renderUsers(getUsersByPage(1));
  } else if (event.target.matches('#home')) {
    filteredUser = []; // 清空過濾的用戶
    currentData = users; //改變資料來源
    // console.log(currentData);
    renderPaginator(currentData.length);
    renderUsers(getUsersByPage(1));
  }
})


axios.get(INDEX_URL)
  .then(response => {
    const userInfo = response.data.results;
    //移除不存在圖片的資料
    users = userInfo.filter(data => data.avatar !== null)
    currentData = users; // 更新currentData 讓值不是空陣列
    // console.log(users);
    renderPaginator(users.length);
    renderUsers(getUsersByPage(1));
  })
  .catch(err => console.log(err))