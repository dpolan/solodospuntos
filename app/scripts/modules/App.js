const App = (() => {
  const STATES = {
    list: {
      detail: 'detail',
    },
    detail: {
      back: 'list'
    },
  };

  let currentState = 'list';

  /**
   * Transition the current state through the given action
   * @param {object} action Action to apply
   */
  const transition = (action) => {
    const flipping = new Flipping();
    flipping.read();

    currentState = STATES[currentState][action];
    document.getElementById('app').dataset.state = currentState;

    // Clear scroll between frames
    document.getElementById('ui-detail').scrollTop = 0;

    flipping.flip();
  };

  /**
   * Searchs for the given post
   * @param {string} slug Post string identifier
   */
  const fetchPost = (slug) => {
    let post = null;

    for (let i = 0, l = POSTS.length; i < l; i += 1) {
      if (POSTS[i].slug === slug) {
        return POSTS[i];
      }
    }

    return post;
  };

  const emptyNode = (node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  const loadPost = (data) => {
    const detail = document.getElementById('ui-detail');

    // Clear the frame
    emptyNode(detail);

    // Append data
    detail.innerHTML += `<p class="post__date" data-flip-key="date">${data.date}</p>`;
    detail.innerHTML += `<h2 class="post__title" data-flip-key="title">${data.title}</h2>`;
    detail.innerHTML += `<div class="post__detail">${data.content}</div>`;
  };

  const clearFlipKeys = () => {
    const elements = document.querySelectorAll('[data-flip-key]');

    elements.forEach((element, index) => {
      element.dataset.flipKey = '';
    });
  };

  const onClickBack = () => {
    transition('back');
  };

  /**
   * Handle post click action
   * @param {object} element DOM element
   * @param {string} slug    Post string identifier
   */
  const onClickPost = (element, slug) => {
    clearFlipKeys();

    const date = document.querySelector(`[data-post-link="${slug}"] .post__date`);
    const title = document.querySelector(`[data-post-link="${slug}"] .post__title`);

    date.dataset.flipKey = 'date';
    title.dataset.flipKey = 'title';

    // Load post data
    const data = fetchPost(slug);
    loadPost(data);

    transition('detail');
  };

  const init = () => {
    // Links
    const posts = document.querySelectorAll('[data-post-link]');

    posts.forEach((post, index) => {
      const slug = post.dataset.postLink;

      const title = post.querySelector('.post__title');
      const arrow = post.querySelector('.button');

      const handler = () => {
        onClickPost(post, slug);
      };

      title.addEventListener('click', handler, false);
      arrow.addEventListener('click', handler, false);
    });

    // Back
    const controlBack = document.querySelectorAll('[data-control-back]');
    controlBack.forEach((control, index) => {
      control.addEventListener('click', onClickBack, false);
    });
  };

  return {
    init,
  };
})();