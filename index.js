const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'   //INDEX_URL+id獲得該部電影詳細資訊（/api/movies/:id）
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const modalPanel = document.querySelector('.modal-dialog')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
const paginator = document.querySelector('#paginator')

//let rawHTML = '' 移至function renderData(data)中，因要列出搜尋結果時會重新渲染頁面需要在渲染頁面前先把內容清空
const movies = []
let searchMovies = []
const MOVIES_PER_PAGE = 12

axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    console.log(response)
    console.log(response.data)
    console.log(response.data.results)
    movies.push(...response.data.results)
    console.log(movies)
    renderPaginator(movies)
    renderData(moviesByPage(1))
  })
  .catch((err) => console.log(err))

function renderData(data) {
  let rawHTML = ''    //初試的頁面渲染前都是空白的
  data.forEach((item) => {
    //item.id用到bootstrap中data-set的概念，只要看到data-開頭就是了，且值都是字串
    rawHTML += `
  <div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img
          src="${POSTER_URL + item.image}"
          class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">     
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>
`
  })
  dataPanel.innerHTML = rawHTML
}

//得到每頁所對應的電影
function moviesByPage(page){ //透過點頁碼監聽得到page
  const data = searchMovies.length ? searchMovies : movies //若searchMovies陣列無則取movies
  let startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE )
}

function renderPaginator(movies){
  let pages = Math.ceil(movies.length / MOVIES_PER_PAGE)
  let rawPageHTML = ''
  for(let i = 1; i <= pages; i ++){
    
    rawPageHTML += `
      <li class="page-item"> <a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = rawPageHTML
}

paginator.addEventListener('click',function clickOnPage(event){
  if (event.target.tagName !== 'A') return //確認按到頁碼的物件上
  let page = Number(event.target.dataset.page)
  renderData(moviesByPage(page))
})

dataPanel.addEventListener('click', function onPanelClick(event) {
  let id = Number(event.target.dataset.id) //注意dataset
  axios.get(INDEX_URL + id)
    .then((response) => {
      const movie = response.data.results //牽涉response的變數先在這裡宣告
      console.log(movie)
    //}) 若response相關的變數包在裡面則下方的會取不到 例如 renderModal的movie
    if (event.target.matches('.btn-show-movie')){
      console.log(event.target)
      renderModal(movie)
    } else if (event.target.matches('.btn-add-favorite')){
      addFavorite(id)
    }
  })
})

function addFavorite(id){
  let pressedMovie = movies.find((movie) => movie.id === id)
  let favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  if (favoriteList.some((movie) => movie.id === id)){
    return alert ('此部電影已收藏過了喔！')
  }
  //}else{ 可不用加 運行方式結果同
    favoriteList.push(pressedMovie)
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
  
}

function renderModal(data){
  //注意URL寫法 變數報在“${}”裡 
  modalPanel.innerHTML =`
      <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="movie-modal-title">${data.title}
      </h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
      </button>
    </div>
    <div class="modal-body" id="movie-modal-body">
      <div class="row">
        <div class="col-sm-8" id="movie-modal-image">
          <img
            src="${POSTER_URL + data.image}"
            alt="movie-poster" class="img-fluid" />
        </div>
        <div class="col-sm-4">
          <p><em id="movie-modal-date">${data.release_date}</em></p>
          <p id="movie-modal-description">${data.description}</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
        Close
      </button>
    </div>
    </div> 
`
 }

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //新增這裡
  let keyWord = searchInput.value.trim().toLowerCase() //小寫功能語法要（）
  searchMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyWord)) //不可有let的原因是這個必須成為全域讓下方的功能可以取
  
  if (!keyWord.length){
    return alert("請輸入有效字串！") //注意return alert語法
  }

  if (searchMovies.length ===0){
    return alert(`您輸入的關鍵字：${keyWord}沒有符合條件的電影`)
  }
  renderPaginator(searchMovies)
  
  renderData(moviesByPage(1))
})

/*按下submit關鍵字》
  找出含有關鍵字的電影searchMovies〉
  放進renderPaginator(searchMovies)》
  moviesByPage(page)：slice出每頁對應的電影(需要更新至全域的searchMovies)
  放進render Data(moviesByPage(1))*/