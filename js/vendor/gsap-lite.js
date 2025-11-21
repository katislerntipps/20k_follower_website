(function () {
    function selectTargets(target) {
        if (!target) return [];
        if (typeof target === 'string') {
            return Array.from(document.querySelectorAll(target));
        }
        if (target instanceof Element) return [target];
        if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
        return [];
    }

    function applyStyles(elements, props) {
        elements.forEach((el) => {
            Object.entries(props || {}).forEach(([key, value]) => {
                if (key === 'duration' || key === 'delay' || key === 'ease' || key === 'stagger' || key === 'scrollTrigger') return;
                if (key === 'xPercent' || key === 'yPercent') {
                    const axis = key === 'xPercent' ? 'X' : 'Y';
                    const existing = el.style.transform || '';
                    const next = `${existing} translate${axis}(${value}%)`;
                    el.style.transform = next.trim();
                    return;
                }
                if (key === 'rotate' || key === 'skewX') {
                    const existing = el.style.transform || '';
                    const next = `${existing} ${key}(${value}deg)`;
                    el.style.transform = next.trim();
                    return;
                }
                if (key === 'scale') {
                    const existing = el.style.transform || '';
                    const next = `${existing} scale(${value})`;
                    el.style.transform = next.trim();
                    return;
                }
                if (key === 'filter') {
                    el.style.filter = value;
                    return;
                }
                el.style[key] = typeof value === 'number' ? `${value}` : value;
            });
        });
    }

    function animate(targets, toVars) {
        const elements = selectTargets(targets);
        const { duration = 0, delay = 0 } = toVars || {};
        const apply = () => applyStyles(elements, toVars);
        if (delay > 0 || duration > 0) {
            setTimeout(apply, delay * 1000 + duration * 1000);
        } else {
            apply();
        }
        return timelineAPI;
    }

    function fromTo(targets, fromVars, toVars) {
        const elements = selectTargets(targets);
        applyStyles(elements, fromVars || {});
        return animate(elements, toVars || {});
    }

    function timelineFactory(defaults = {}) {
        const api = {
            to(targets, vars, position) {
                const merged = Object.assign({}, defaults, vars || {});
                animate(targets, merged);
                return api;
            },
            from(targets, vars, position) {
                const merged = Object.assign({}, defaults, vars || {});
                const elements = selectTargets(targets);
                applyStyles(elements, merged);
                return api;
            },
            fromTo(targets, fromVars, toVars, position) {
                const merged = Object.assign({}, defaults, toVars || {});
                fromTo(targets, fromVars || {}, merged);
                return api;
            },
            set(targets, vars, position) {
                applyStyles(selectTargets(targets), Object.assign({}, defaults, vars || {}));
                return api;
            },
            timeScale() { return api; },
            restart() { return api; },
            pause() { return api; }
        };
        return api;
    }

    const gsap = {
        set: applyStyles,
        to: animate,
        from(targets, vars) {
            const elements = selectTargets(targets);
            applyStyles(elements, vars || {});
            return timelineAPI;
        },
        fromTo,
        timeline(options = {}) {
            return timelineFactory(options.defaults || {});
        },
        registerPlugin() {},
        utils: {
            random(min, max) {
                const delta = max - min;
                return min + Math.random() * delta;
            },
            normalize(min, max, value) {
                if (max - min === 0) return 0;
                return (value - min) / (max - min);
            },
            interpolate(start, end, progress) {
                return start + (end - start) * progress;
            }
        }
    };

    const timelineAPI = timelineFactory();

    const ScrollTrigger = {
        create() {
            return {
                kill() {},
                refresh() {}
            };
        }
    };

    window.gsap = gsap;
    window.ScrollTrigger = ScrollTrigger;
})();
