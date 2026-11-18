(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 768px)");
    const groups = new Map();
    let observer;

    function prepareItem(item, index, step) {
        if (item.classList.contains("scroll-reveal")) return;

        item.classList.add("scroll-reveal");
        item.style.setProperty("--reveal-delay", `${Math.min(index * step, 350)}ms`);
    }

    function reveal(group) {
        group.root.dataset.revealActive = "true";

        requestAnimationFrame(() => {
            group.items.forEach(item => item.classList.add("is-revealed"));
        });
    }

    function registerGroup(rootSelector, itemSelector) {
        const root = document.querySelector(rootSelector);
        if (!root) return;

        const step = mobileViewport.matches ? 45 : 70;
        const items = [...root.querySelectorAll(itemSelector)];

        items.forEach((item, index) => prepareItem(item, index, step));

        const group = { root, items, step };
        groups.set(root, group);

        if (reducedMotion.matches || !observer) {
            reveal(group);
            return;
        }

        observer.observe(root);
    }

    function registerDynamicArticles() {
        const container = document.getElementById("homeArtigos");
        const section = container?.closest(".conheça-tea-home");
        const group = section ? groups.get(section) : null;
        if (!container || !group) return;
        let articleIndex = 0;

        const addCards = nodes => {
            const cards = nodes.flatMap(node => {
                if (!(node instanceof Element)) return [];
                if (node.matches(".card-artigo-home")) return [node];
                return [...node.querySelectorAll(".card-artigo-home")];
            });

            cards.forEach(card => {
                prepareItem(card, articleIndex, group.step);
                card.style.setProperty("--reveal-delay", `${Math.min(articleIndex * group.step, 210)}ms`);
                articleIndex += 1;

                if (!group.items.includes(card)) group.items.push(card);

                if (group.root.dataset.revealActive === "true" || reducedMotion.matches) {
                    requestAnimationFrame(() => card.classList.add("is-revealed"));
                }
            });
        };

        addCards([...container.children]);

        new MutationObserver(mutations => {
            addCards(mutations.flatMap(mutation => [...mutation.addedNodes]));
        }).observe(container, { childList: true });
    }

    function revealEverything() {
        groups.forEach(group => reveal(group));
        observer?.disconnect();
    }

    function initialize() {
        if ("IntersectionObserver" in window && !reducedMotion.matches) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    const group = groups.get(entry.target);
                    if (!group) return;

                    reveal(group);
                    observer.unobserve(entry.target);
                });
            }, {
                threshold: 0.12,
                rootMargin: "0px 0px -10%"
            });
        }

        /* Home */
        registerGroup(".hero", ":scope > h1, :scope > p");
        registerGroup(".profissionais-home", ":scope > .texto-home, .conteiner-prof-home > a, :scope > a");
        registerGroup(".funcionamento-home", ":scope > .texto-home, .card-como-funciona");
        registerGroup(".pq-escolha-home", ":scope > .texto-home, .card-escolhas");
        registerGroup(".conheça-tea-home", ".conteiner-conheça-tea > h1, .conteiner-conheça-tea > p, .home-artigos-retry, .card-artigo-home, .conteiner-conheça-tea > a");
        registerGroup(".aplicativo-home", ".texto-app-home > h1, .texto-app-home > p, .beneficios-app > h2, .card-beneficios-home");
        registerGroup(".criar-conta-home", ".home-cta-content");

        /* Sobre nós */
        registerGroup(".hero-sobre-nos", ".hero-conteudo > h1, .hero-conteudo > .hero-linha, .hero-conteudo > p");
        registerGroup(".objetivo-sobre-nos", ".nosso-objetivo, .chave-card");
        registerGroup(".porque-criamos", ".porque-topo, .porque-cards > .card");
        registerGroup(".nossa-equipe", ".topo-nossa-equipe, .carrossel-equipe");
        registerGroup(".contato", ":scope > h2, :scope > h1, :scope > form");

        registerDynamicArticles();

        if (!observer || reducedMotion.matches) revealEverything();

        reducedMotion.addEventListener?.("change", event => {
            if (event.matches) revealEverything();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
