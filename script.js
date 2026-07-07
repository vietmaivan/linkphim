// scriptmau.js
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const menuSections = document.querySelectorAll(".menu-section");
  const MAIN = document.getElementById("main");

  // Toggle sidebar (mobile)
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (e) => {
      const isActive = sidebar.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
      e.stopPropagation();
    });
  }

  // Click outside to close sidebar on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  // Accordion behavior for top-level sections on mobile
  function setupSectionToggle() {
    menuSections.forEach(section => {
      const toggle = section.querySelector(".menu-link");
      const sub = section.querySelector(".sub-menu");
      if (!toggle) return;

      toggle.addEventListener("click", (e) => {
        // On desktop we don't intercept (hover shows submenu)
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const isOpen = section.classList.toggle("open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

          // Close others
          menuSections.forEach(s => {
            if (s !== section) {
              s.classList.remove("open");
              const t = s.querySelector(".menu-link");
              if (t) t.setAttribute("aria-expanded", "false");
            }
          });
        }
      });
    });
  }

  setupSectionToggle();
  window.addEventListener("resize", () => {
    // ensure sidebar closed when resized to desktop
    if (window.innerWidth > 768) {
      sidebar.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuSections.forEach(s => s.classList.remove("open"));
    }
  });

  // Load menu from JSON and render items
  async function loadMenu() {
    try {
      const res = await fetch("data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      // render helper: supports item properties {name, link, icon, badge}
      const render = (id, items) => {
        const ul = document.getElementById(id);
        if (!ul) return;
        ul.innerHTML = ""; // clear

        items.forEach((item, idx) => {
          const li = document.createElement("li");
          li.className = "tablinks";
          li.setAttribute("role", "none");

          const a = document.createElement("a");
          a.setAttribute("role", "menuitem");
          a.setAttribute("tabindex", "0");
          a.href = item.link || "#";
          if (item.link && item.link !== "#") a.target = "_blank";
          a.rel = "noopener noreferrer";

          // icon (optional) — if item.icon is provided use it, else default
          const iconSpan = document.createElement("span");
          iconSpan.className = "menu-icon";
          if (item.icon) {
            // allow font-awesome class provided in JSON, e.g. "fa-solid fa-newspaper"
            const i = document.createElement("i");
            i.className = item.icon;
            iconSpan.appendChild(i);
          } else {
            const i = document.createElement("i");
            i.className = "fas fa-angle-right";
            iconSpan.appendChild(i);
          }

          const textSpan = document.createElement("span");
          textSpan.className = "menu-text";
          textSpan.textContent = item.name || "Untitled";

          a.appendChild(iconSpan);
          a.appendChild(textSpan);

          // badge (optional)
          if (item.badge) {
            const badge = document.createElement("span");
            badge.className = "menu-badge";
            badge.textContent = item.badge;
            a.appendChild(badge);
          }

          // click handler: close sidebar on mobile and mark active
          a.addEventListener("click", (e) => {
            // mark selected
            ul.querySelectorAll(".tablinks").forEach(n => n.classList.remove("active"));
            li.classList.add("active");

            if (window.innerWidth <= 768) {
              sidebar.classList.remove("active");
              menuToggle.setAttribute("aria-expanded", "false");
            }
            // Optional: you can load content via AJAX here instead of opening link
            // Example: load article into MAIN when link is internal and not target blank
            if (a.target !== "_blank") {
              e.preventDefault();
              // Very simple demo: show name in the main content area
              const title = item.name || "Nội dung";
              const newsBox = document.querySelector(".news-box");
              if (newsBox) {
                newsBox.innerHTML = `<h1>${title}</h1><p>Nội dung đang chờ cập nhật...</p>`;
              }
            }
          });

          li.appendChild(a);
          ul.appendChild(li);
        });
      };

      if (Array.isArray(data.phim_1)) render("menu-phim-1", data.phim_1);
      if (Array.isArray(data.vo_dao)) render("menu-vo-dao", data.vo_dao);

    } catch (err) {
      console.error("Lỗi load menu:", err);

      // fallback: insert some static items so menu is not empty
      const fallback = [
        { name: "Tin mẫu 1", link: "#" },
        { name: "Tin mẫu 2", link: "#" }
      ];
      const renderFallback = (id, items) => {
        const ul = document.getElementById(id);
        if (!ul) return;
        ul.innerHTML = items.map(it => `<li class="tablinks"><a href="#">${it.name}</a></li>`).join("");
      };
      renderFallback("menu-phim-1", fallback);
      renderFallback("menu-vo-dao", fallback);
    }
  }

  loadMenu();
});