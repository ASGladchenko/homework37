const mainContent = document.querySelector('.main__content');
const btnPosts = document.querySelector('#btnPosts');
const btnUsers = document.querySelector('#btnUsers');
const navigationMenu = document.querySelector('.header__navigation')
navigationMenu.addEventListener('click', event => {
    if (event.target.id === 'btnPosts') {
        mainContent.innerHTML = ''
        let templatesPostsForm = `
            <div class="main__message_alert d-none">
                <p>Our message</p>
            </div>
            <button id="selectAllPosts" class="postsBtn">Select all posts</button>   
            <button id="getAllPosts" class="postsBtn">Get all posts</button>   
            <button id="deletePosts" class="postsBtn">Delete</button>
            <form id="addPosts" class="add_posts">
                <h3> Create your posts</h3>
                <input type="text" placeholder="   Enter the title of your post...">
                <div>
                    <span>Choose your id :</span>
                    <select>
                        <option></option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                    </select>
                </div>
                <button id="btnAddPost">Create post</button>
                <textarea placeholder="Write your post here ..."></textarea>
            </form>
            <span class="main__message_empty">You don't have any entries</span>
            <div class="main__cards_posts  ">

            </div>
    `
        mainContent.insertAdjacentHTML('afterbegin', templatesPostsForm)
        const mainContainer = document.querySelector('.main__content');
        const postsAlertMessage = mainContent.querySelector('.main__message_alert')
        const mainCardsPosts = mainContainer.querySelector('.main__cards_posts');
        const formCreatePost = mainContainer.querySelector('#addPosts');
        const btnCreatePost = formCreatePost.querySelector('#btnAddPost');
        const btnGetAllPosts = mainContainer.querySelector('#getAllPosts');
        const btnDeletePosts = mainContainer.querySelector('#deletePosts')
        const btnSelectAllPosts = mainContainer.querySelector('#selectAllPosts')

        mainContent.addEventListener('click', event => {
            let target = event.target;

            if (target === btnCreatePost) {
                let postTitle = formCreatePost.querySelector('input');
                let postId = formCreatePost.querySelector('select');
                let postBody = formCreatePost.querySelector('textarea');
                event.preventDefault()
                if (!isPostFormValid(postBody, postTitle, postId)) {
                    popUpMessage(postsAlertMessage, 1000, '#f69e9e', "Form filled out incorrectly")
                    return false
                }

                fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: postTitle.value,
                        body: postBody.value,
                        userId: postId.value,
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },

                })
                    .then((response) => response.json())
                    .then((json) => {
                        renderPost([json])
                    })
                    .catch(err => console.log('error :', err))
                formCreatePost.reset();
                popUpMessage(postsAlertMessage, 1000, '#bafdb3', "You successfully created a post")

            }
            if (target === btnGetAllPosts) {
                fetch('https://jsonplaceholder.typicode.com/posts').then((response) => response.json()).then((json) => {
                    mainCardsPosts.innerHTML = ""
                    renderPost(json)
                })
                    .catch(err => console.log('error', err))
                popUpMessage(postsAlertMessage, 1000, '#bafdb3', "Your request was successful")

            }
            if (target === btnDeletePosts) {
                let path = "https://jsonplaceholder.typicode.com/posts/"
                let regExp = /\d+$/
                Array.from(mainCardsPosts.children).forEach(card => {
                    if (card.classList.contains('main__post_active')) {
                        path += card.querySelector('.main__post_id').innerHTML.match(regExp)[0]
                        fetch('https://jsonplaceholder.typicode.com/posts/1', {
                            method: 'DELETE',
                        })
                        card.remove()
                    }
                })
                if (mainCardsPosts.children.length < 1) mainContainer.querySelector('.main__message_empty').classList.remove('d-none')
            }
            if (target === btnSelectAllPosts) {
                let tmp;
                Array.from(mainCardsPosts.children).forEach(el => {
                    if (!el.classList.contains('main__post_active')) tmp = true

                })
                if (tmp) {
                    Array.from(mainCardsPosts.children).forEach(el => {
                        el.classList.add('main__post_active')

                    })
                } else {
                    Array.from(mainCardsPosts.children).forEach(el => {
                        el.classList.remove('main__post_active')

                    })
                }
            }

        })

        mainCardsPosts.addEventListener('click', event => {
            let target = event.target
            if (target.closest('.main__cards_post') && !target.classList.contains('main__post_comments')) {
                if (target.closest('.main__cards_post').classList.contains('main__post_active')) {
                    target.closest('.main__cards_post').classList.remove('main__post_active')
                } else {
                    target.closest('.main__cards_post').classList.add('main__post_active')

                }
            }
            if (target.classList.contains('main__post_comments')) {
                if (target.innerHTML !== 'See comments ...') {
                    target.nextElementSibling.remove()
                    target.innerHTML = 'See comments ...'
                    return false
                }
                let url = 'https://jsonplaceholder.typicode.com/posts/'
                let regExp = /\d+$/
                url += target.closest('.main__cards_post').querySelector('.main__post_id').innerHTML.match(regExp)[0] + "/comments"
                fetch(url).then((response) => response.json()).then((json) => {
                    let comments = renderCommentsContainer(renderComments(json));
                    if (json.length === 0) comments = renderCommentsContainer("You doesn't have any comments");
                    target.closest('.main__cards_post').insertAdjacentHTML('beforeend', comments)

                })
                target.innerHTML = 'Close comments ^'

            }
        })

        function renderPost(arr) {
            let post = arr.map((el) => {
                return `
        <div class="main__cards_post">
           <span class="main__post_id">Post Id :${el.id}</span>
            <span class="main__post_userId">User Id:${el.userId}</span>
            <h4 class="main__post_title">${el.title}</h4>
            <p class="main__post_body">${el.body}</p>
            <p class="main__post_comments d-none">See comments ...</p>
          
        </div>`
            }).join('')
            mainContainer.querySelector('.main__message_empty').classList.add('d-none')
            mainCardsPosts.insertAdjacentHTML('beforeend', post)
        }

        function renderCommentsContainer(comments) {
            return `<div className="main__post_container">
                            <h3>Comments :</h3>
                        ${comments}
                    </div>`
        }

        function renderComments(arr) {
            return arr.map((el) => {
                return `        <div class="main__card_comment">
                <span class="main__comment_topic"> Topic : ${el.name}</span>      
                <p>${el.body}
                <span class="main__comment_email"> From : <a>${el.email}</a></span>   
        </div>`
            }).join('')

        }

    }
    if (event.target.id === 'btnUsers') {
        mainContent.innerHTML = "";
        mainContent.insertAdjacentHTML('afterbegin', `<h2>Sorry, but this part in progress</h2>`)
    }
})


function isPostFormValid(...arguments) {
    let isValid = true;
    arguments.forEach(el => {
        if ((el.tagName === "SELECT" && el.value === "") || (el.tagName !== "SELECT" && el.value.length < 3)) {
            isValid = false;
            el.classList.add('inCorrect')
        } else {
            el.classList.remove('inCorrect')
        }
    })
    return isValid
}

function popUpMessage(element, timeout, bgc = '', messageText) {
    element.querySelector('p').innerHTML = messageText
    element.style.backgroundColor = bgc
    element.classList.remove(`d-none`)
    setTimeout(() => element.classList.add('d-none'), timeout)
}
