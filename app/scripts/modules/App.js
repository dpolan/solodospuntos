const App = (() => {
  const CONFIG = {
    endpoint: 'http://solodospuntos/wp-json/wp/v2/',
  };

  const STATES = {
    list: {
      detail: 'detail',
    },
    detail: {
      back: 'list'
    },
  };

  const EVENTS = {
    APP_START: 'APP_START',
    STATE_CHANGE: 'STATE_CHANGE',
  };

  const SCREENS = {
    SM: 540,
    MD: 768,
  };

  let posts = [];
  let currentState;

  /**
   * Transition the current state through the given action
   * @param {object} action Action to apply
   */
  const transition = (action) => {
    const flipping = new Flipping();
    flipping.read();

    currentState = STATES[currentState][action];
    document.getElementById('app').dataset.state = currentState;

    window.dispatchEvent(new Event(EVENTS.STATE_CHANGE));

    // Clear scroll between frames
    document.getElementById('ui-detail').scrollTop = 0;

    flipping.flip();
  };

  const parseDate = date => moment(date).format('DD/MM/YYYY');

  /**
   * Searchs for the given post
   * @param {string}   slug     Post string identifier
   * @param {function} callback Load callback
   */
  const fetchPost = (slug, callback) => {
    let post = null;

    for (let i = 0, l = posts.length; i < l; i += 1) {
      if (posts[i].slug === slug) {
        return callback(posts[i]);
      }
    }
  };

  /**
   * Store the post on the inner array
   * @param {object} post Post data
   */
  const storePost = (post) => {
    posts.push({
      slug: post.slug,
      date: post.date,
      title: post.title.rendered,
      content: post.content.rendered,
    });
  };

  /**
   * Configure tiny-sliders instances
   */
  const configureSliders = () => {
    document.querySelectorAll('[data-slider]')
      .forEach((element, index) => {
        tns({
          container: element,
          items: 1,
          mouseDrag: true,
          slideBy: 'page',
          swipeAngle: false,
          speed: 400,
          controls: false,
          nav: false,
        });
      });
  };

  /**
   * Configure links of the existing posts
   */
  const configureLinks = () => {
    const posts = document.querySelectorAll('[data-post-link]');

    posts.forEach((post) => {
      const slug = post.dataset.postLink;

      const title = post.querySelector('.post__title');
      const arrow = post.querySelector('.button');

      const handler = () => {
        onClickPost(post, slug);
      };

      title.addEventListener('click', handler, false);
      arrow.addEventListener('click', handler, false);
    });
  };

  /**
   * Handle post fetch action result
   * @param {object} response Promise response
   */
  const onFetchPost = (response) => {
    const wrapper = document.getElementById('ui-content');
    emptyNode(wrapper);

    // Populate
    response.data.forEach((post) => {
      storePost(post);

      wrapper.innerHTML +=
        `<article class="post post--${post.slug} is-dark" data-post-link="${post.slug}">
          <p class="post__date">${parseDate(post.date)}</p>
          <h2 class="post__title">${post.title.rendered}</h2>

          <div class="post__excerpt">
            ${post.excerpt.rendered}

            <button class="button button--rarrow"></button>
        </article>`;
    });

    // Listeners
    configureLinks();
  };

  /**
   * Fetch the published posts
   */
  const fetchPosts = () => {
    axios.get(`${CONFIG.endpoint}posts`)
      .then(onFetchPost)
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * Empties the DOM node, removing his chidlren
   * @param {object} node DOM node
   */
  const emptyNode = (node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  /**
   * Loads the post content into the detail view
   * @param {object} data Post data
   */
  const loadPost = (post) => {
    const detail = document.getElementById('ui-detail');

    // History
    window.history.pushState(null, post.title, `/p/${post.slug}`);

    // Clear the frame
    emptyNode(detail);

    detail.className = `ui-detail prev-black detail--${post.slug}`;

    // Append data
    detail.innerHTML +=
    '<div class="detail__post">' +
      ((window.innerWidth < SCREENS.SM)
        ? `<p class="post__date" data-flip-key="date">${parseDate(post.date)}</p>`
        : `<p class="post__date">${parseDate(post.date)}</p>`) +
      ((window.innerWidth < SCREENS.SM)
        ? `<h2 class="post__title" data-flip-key="title">${post.title}</h2>`
        : `<h2 class="post__title">${post.title}</h2>`) +
      `<div class="post__detail">${post.content}</div>
    </div>`;

    // Slick sliders
    configureSliders();
  };

  /**
   * Clear the current existing flipping keys
   */
  const clearFlipKeys = () => {
    const elements = document.querySelectorAll('[data-flip-key]');

    elements.forEach((element, index) => {
      element.dataset.flipKey = '';
    });
  };

  /**
   * Handle back button click
   */
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
    fetchPost(slug, loadPost);
    transition('detail');
  };

  /**
   * Handle state change action
   */
  const onStateChange = () => {
    const handler = {
      list: () => {
        window.history.pushState(null, 'Homepage', '/');
      },
    };

    if (handler[currentState]) {
      handler[currentState]();
    }
  };

  /**
   * Initializes the application
   */
  const init = () => {
    currentState = window.app.dataset.state;

    // Back
    const controlBack = document.querySelectorAll('[data-control-back]');
    controlBack.forEach((control, index) => {
      control.addEventListener('click', onClickBack, false);
    });

    // General event handling
    window.addEventListener(EVENTS.APP_START, fetchPosts, false)
    window.addEventListener(EVENTS.STATE_CHANGE, onStateChange);

    // Initialization
    document.getElementById('header')
      .addEventListener('animationend', () => {
        window.dispatchEvent(new Event(EVENTS.APP_START));
      }, false);
  };

  return {
    init,
  };
})();