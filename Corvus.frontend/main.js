const header = document.getElementById("header");
const search = document.getElementById("search");
const searchToggle = document.getElementById("searchToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuToggle = document.getElementById("menuToggle");


// Header background on scroll
const onScroll = () => {
  const scrolled = window.scrollY > 40;

  header.classList.toggle("is-scrolled", scrolled);
};


window.addEventListener(
  "scroll",
  onScroll,
  { passive: true }
);

onScroll();


// Sync header open state
const syncOpenState = () => {

  const anyOpen =
    !search.hidden ||
    !mobileMenu.hidden;

  header.classList.toggle(
    "is-open",
    anyOpen
  );

  onScroll();
};


// Close all navigation panels
const closeAll = () => {

  search.hidden = true;

  mobileMenu.hidden = true;


  menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );


  document.body.classList.remove(
    "no-scroll"
  );


  syncOpenState();
};


// Search
searchToggle.addEventListener(
  "click",
  () => {

    const wasOpen = !search.hidden;


    closeAll();


    if (!wasOpen) {

      search.hidden = false;

      search
        .querySelector("input")
        .focus();

    }


    syncOpenState();

  }
);


// Mobile menu
menuToggle.addEventListener(
  "click",
  () => {

    const wasOpen = !mobileMenu.hidden;


    closeAll();


    if (!wasOpen) {

      mobileMenu.hidden = false;


      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );


      document.body.classList.add(
        "no-scroll"
      );

    }


    syncOpenState();

  }
);


// Escape closes open menus
document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {
      closeAll();
    }

  }
);


// Clicking outside closes menus
document.addEventListener(
  "click",
  (event) => {

    if (
      !header.contains(event.target) &&
      !mobileMenu.contains(event.target)
    ) {

      closeAll();

    }

    else if (
      event.target.closest(
        ".mobile-menu a"
      )
    ) {

      closeAll();

    }

  }
);


// Reveal on scroll
const revealObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "is-visible"
          );


          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.15
    }

  );


document
  .querySelectorAll(".reveal")
  .forEach((element) => {

    revealObserver.observe(element);

  });


// Count-up stats
const countObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }


        const element =
          entry.target;


        const target =
          Number(element.dataset.count);


        const suffix =
          element.dataset.suffix || "";


        const start =
          performance.now();


        const duration =
          1600;


        const tick = (now) => {

          const progress =
            Math.min(
              (now - start) / duration,
              1
            );


          const eased =
            1 -
            Math.pow(
              1 - progress,
              3
            );


          element.textContent =
            Math.round(
              target * eased
            ).toLocaleString() +
            suffix;


          if (progress < 1) {

            requestAnimationFrame(
              tick
            );

          }

        };


        requestAnimationFrame(
          tick
        );


        countObserver.unobserve(
          element
        );

      });

    },

    {
      threshold: 0.5
    }

  );


document
  .querySelectorAll("[data-count]")
  .forEach((element) => {

    countObserver.observe(
      element
    );

  });



// Scroll-driven word reveal
document
  .querySelectorAll("[data-text-reveal]")
  .forEach((element) => {

    const track =
      element.closest(".text-reveal");


    const words =
      element.textContent.trim().split(/\s+/);


    element.textContent = "";


    const spans = words.map((word, index) => {

      const span =
        document.createElement("span");

      span.className = "text-reveal__word";
      span.textContent = word;

      element.append(span);

      if (index < words.length - 1) {
        element.append(" ");
      }

      return span;

    });


    const update = () => {

      const rect =
        track.getBoundingClientRect();


      const scrollable =
        rect.height - window.innerHeight;


      const progress =
        Math.min(
          Math.max(-rect.top / scrollable, 0),
          1
        );


      spans.forEach((span, index) => {

        const start = index / spans.length;

        const local =
          Math.min(
            Math.max((progress - start) * spans.length, 0),
            1
          );

        span.style.opacity = 0.2 + local * 0.8;

      });

    };


    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      update
    );

    update();

  });



// Logo carousel: columns that cycle through shuffled logos
const shuffle = (items) => {

  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};


const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


document
  .querySelectorAll("[data-logo-carousel]")
  .forEach((carousel) => {

    const logos =
      [...carousel.querySelectorAll("li")]
        .map((item) => item.innerHTML.trim());


    const columnCount =
      Number(carousel.dataset.columns) || 2;


    // Deal shuffled logos round-robin, then pad short columns
    const shuffled = shuffle(logos);

    const columns =
      Array.from({ length: columnCount }, () => []);

    shuffled.forEach((logo, index) => {
      columns[index % columnCount].push(logo);
    });

    const maxLength =
      Math.max(...columns.map((column) => column.length));

    columns.forEach((column) => {
      while (column.length < maxLength) {
        column.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
      }
    });


    columns.forEach((column, index) => {

      const element =
        document.createElement("div");

      element.className = "logo-carousel__column reveal";
      element.style.transitionDelay = `${index * 0.1}s`;
      element.setAttribute("aria-hidden", "true");

      carousel.append(element);

      revealObserver.observe(element);


      const show = (logoIndex) => {

        const item =
          document.createElement("div");

        item.className = "logo-carousel__item is-entering";
        item.innerHTML = column[logoIndex];

        element.append(item);

        // Commit the entering state before animating to rest
        item.getBoundingClientRect();
        item.classList.remove("is-entering");

        return item;

      };


      let current = 0;

      let item = show(current);


      if (reduceMotion) {
        return;
      }


      const cycle = () => {

        const leaving = item;

        leaving.classList.add("is-exiting");

        current = (current + 1) % column.length;

        setTimeout(() => {

          leaving.remove();

          item = show(current);

        }, 300);

      };


      // Stagger columns by 200ms, then cycle every 2s
      setTimeout(() => {

        cycle();

        setInterval(cycle, 2000);

      }, 2000 - index * 200);

    });

  });


// Current year
document
  .getElementById("year")
  .textContent =
    new Date().getFullYear();
