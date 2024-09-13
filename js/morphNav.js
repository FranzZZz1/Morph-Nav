document.addEventListener("DOMContentLoaded", function () {
    class MorphDropdown {
        /*
         * By using this code, you agree that you will not change/modify its structure
         * and use some parts of it in your other projects.
         * Created by: FranzZZz1, https://github.com/FranzZZz1.
         */
        constructor(element, options = {}) {
            this.element = this.#inspectVariable(document, element);

            this.options = Object.assign(
                {
                    nav: ".header__nav",
                    navItem: "[data-js-target='nav__item--dropdown']",
                    dropList: "[data-js-target='header-dropdown__list']",
                    dropItem: ".header-dropdown__item",
                    dropContent: ".header-dropdown__content",
                    dropFooter: "[data-js-target='dropdown-footer']",
                    dropFooterMode: "height",
                    dropBg: ".dropdown-bg",
                    dropBgFooter: ".dropdown-bg__footer",
                    dropVisibleClass: "is-dropdown-visible",
                    dropArrow: ".header__dropdown-arrow",
                    dropActiveClass: "active",
                    navActiveClass: "active",
                    containerWidth: 1080,
                    containerPadding: 20,
                    dropPadding: false,
                    dropMobilePadding: false,
                    cacheFooterPositions: true,
                    cacheFooterDebug: false,
                    watchCachedFooterPositions: true,
                    xValues: {
                        1: -400,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: -190,
                    },
                },
                options
            );

            for (let key in this.options) {
                this[key] = this.options[key];
            }

            this.#initializeVariables();
            this.#initAttributes();
            this.#initErrors();
            this.#initFunctions();
            this.mq = this.#checkMq();

            this.#initDropdownItemsWidth();
        }

        directions = {
            left: "left",
            right: "right",
            hleft: "half-left",
            hright: "half-right",
        };

        modes = {
            height: "height-mode",
            transform: "transform-mode",
        };

        #initDropdownItemsWidth() {
            this.dropdownItems.forEach((e) => {
                e.style.setProperty("--initial-width", e.offsetWidth + "px");
            });
        }

        #initAttributes() {
            this.dropdownItems.forEach((e) => {
                e.setAttribute("aria-hidden", "true");
            });
            if (typeof this.dropFooterMode === "string") {
                if (this.dropFooterMode === "height") {
                    this.dropdownList.classList.add(this.modes.height);
                } else if (this.dropFooterMode === "transform") {
                    this.dropdownList.classList.add(this.modes.transform);
                }
            }
        }

        #initErrors() {
            if (this.dropdownItems.length > this.mainNavigationItems.length) {
                throw new Error(
                    "The number of sections should not exceed the number of menu items"
                );
            }
        }

        #initFunctions() {
            const sectionXValues = this.xValues;
            const cachedDistances = new Map();

            this.updateMenuAlignment = (activeMenuSectionIndex, sectionOffset) => {
                const windowWidth = window.innerWidth;
                const columnPadding =
                    parseInt(
                        getComputedStyle(document.documentElement).getPropertyValue(
                            "--columnPaddingNormal"
                        ),
                        10
                    ) || 0;
                const rootWidth = document.documentElement.clientWidth;

                let scrollbarWidth = windowWidth - rootWidth;

                const containerPadding = this.containerPadding;
                let containerWidth =
                    this.containerWidth - (this.dropPadding ? containerPadding * 2 : 0);

                this.mobileScreenWidth = containerWidth + containerPadding * 2 + scrollbarWidth;

                if (windowWidth < this.mobileScreenWidth) {
                    containerWidth =
                        windowWidth -
                        scrollbarWidth +
                        (this.dropMobilePadding ? columnPadding * 2 - containerPadding * 2 : 0);
                }

                let offset = 0;
                const xValues = sectionXValues[activeMenuSectionIndex + 1];

                if (activeMenuSectionIndex >= 0) {
                    const activeNavItem = this.mainNavigationItems[activeMenuSectionIndex];
                    const navItemRect = activeNavItem.getBoundingClientRect();
                    const navItemCenter = navItemRect.left + navItemRect.width / 2;

                    offset =
                        navItemCenter -
                        sectionOffset / 2 -
                        ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) +
                        xValues;

                    if (typeof xValues === "number") {
                        if (xValues >= sectionOffset / 2 - scrollbarWidth / 2 - containerPadding) {
                            if (
                                offset + sectionOffset >
                                navItemCenter -
                                    ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2)
                            ) {
                                offset = Math.max(
                                    navItemCenter -
                                        ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) -
                                        scrollbarWidth / 2 -
                                        containerPadding,
                                    0
                                );
                            }
                        } else if (xValues < 0) {
                            if (
                                Math.abs(xValues) >=
                                sectionOffset / 2 - scrollbarWidth / 2 - containerPadding
                            ) {
                                if (
                                    xValues + sectionOffset <
                                    navItemCenter -
                                        ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2)
                                ) {
                                    offset = Math.max(
                                        navItemCenter -
                                            ((windowWidth - containerWidth) / 2 -
                                                scrollbarWidth / 2) -
                                            sectionOffset +
                                            scrollbarWidth / 2 +
                                            containerPadding,
                                        0
                                    );
                                }
                            }
                        }
                    } else if (xValues === this.directions.left) {
                        offset =
                            navItemCenter -
                            ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) -
                            scrollbarWidth / 2 -
                            containerPadding;
                    } else if (xValues === this.directions.right) {
                        offset =
                            navItemCenter -
                            ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) -
                            sectionOffset +
                            scrollbarWidth / 2 +
                            containerPadding;
                    } else if (xValues === this.directions.hleft) {
                        offset =
                            navItemCenter -
                            ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) -
                            sectionOffset / 4 -
                            scrollbarWidth / 2 -
                            containerPadding;
                    } else if (xValues === this.directions.hright) {
                        offset =
                            navItemCenter -
                            ((windowWidth - containerWidth) / 2 - scrollbarWidth / 2) -
                            sectionOffset / 1.5 -
                            scrollbarWidth / 2;
                    }

                    offset = Math.max(offset, 0);
                    offset = Math.min(offset, containerWidth - sectionOffset);
                }

                let menuTranslateX = Math.round(
                    offset + (windowWidth - containerWidth) / 2 - scrollbarWidth / 2
                );

                if (windowWidth > this.mobileScreenWidth) {
                    menuTranslateX = Math.max(
                        containerPadding,
                        Math.min(menuTranslateX, containerWidth + containerPadding)
                    );
                } else {
                    menuTranslateX = Math.max(
                        this.dropMobilePadding ? containerPadding : 0,
                        Math.min(menuTranslateX, containerWidth + containerPadding - sectionOffset)
                    );
                }

                // this.dropdownList.style.transform = `translateX(${menuTranslateX}px)`;

                this.dropdownList.style.setProperty(
                    "--dropdown-list-translate-x",
                    `${menuTranslateX}px`
                );
            };

            this.positionElements = (activeMenuSectionIndex) => {
                this.dropdownArrow = this.#inspectVariable(
                    this.element,
                    this.dropArrow,
                    false,
                    false,
                    false
                );

                if (activeMenuSectionIndex === -1) {
                    if (this.hasSubMenus) {
                        let menuHeight = this.menuSections[0].offsetHeight;
                        this.menu.style.setProperty("--morphNav-menu-height", `${menuHeight}px`);
                    }
                    return;
                }

                let section = this.dropdownItems[activeMenuSectionIndex];
                let trigger = this.mainNavigationItems[activeMenuSectionIndex];

                if (this.dropdownArrow) {
                    let halfWindowWidth = document.documentElement.clientWidth / 2;
                    let triggerCenter =
                        trigger.getBoundingClientRect().left + trigger.offsetWidth / 2;
                    let arrowOffset = -1 * (halfWindowWidth - triggerCenter);
                    this.element.style.setProperty("--morphNav-arrow-offset", `${arrowOffset}px`);
                }

                let sectionWidth =
                    +section.style.getPropertyValue("--initial-width").slice(0, -2) ??
                    section.offsetWidth;
                let sectionHeight = section.offsetHeight;

                this.dropdownList.style.width = `${sectionWidth}px`;
                this.dropdownList.style.setProperty("--morphNav-menu-height", `${sectionHeight}px`);

                section.setAttribute("aria-hidden", "false");

                this.updateMenuAlignment(activeMenuSectionIndex, sectionWidth);
            };

            this.calcDropdownFooterHeight = (selectedDropdown) => {
                const selectedDropdownFooter = this.#inspectVariable(
                    selectedDropdown,
                    this.dropFooter,
                    false,
                    false,
                    false
                );

                if (!selectedDropdownFooter) return 0;

                const selectedDropdownFooterHeight = selectedDropdownFooter.offsetHeight;

                return parseInt(selectedDropdownFooterHeight);
            };

            this.showDropdown = (item) => {
                this.mq = this.#checkMq();
                if (this.mq == "desktop") {
                    const itemDataContent = item.getAttribute("data-content");
                    const selectedDropdown = this.dropdownList.querySelector(`#${itemDataContent}`);

                    const dropdownContents = this.mainNavigation.querySelectorAll("[data-content]");
                    dropdownContents.forEach((content) => {
                        this.dropdownList.classList.remove(content.getAttribute("data-content"));
                    });
                    this.dropdownList.classList.add(itemDataContent);

                    this.openDropdownIndex = null;
                    if (selectedDropdown) {
                        const selectedContent = this.#inspectVariable(
                            selectedDropdown,
                            this.dropContent
                        );

                        const itemRect = item.getBoundingClientRect();
                        const selectedDropdownHeight = selectedDropdown.clientHeight;
                        const selectedDropdownWidth =
                            +selectedDropdown.style
                                .getPropertyValue("--initial-width")
                                .slice(0, -2) ?? selectedContent.clientWidth;
                        const selectedDropdownLeft =
                            itemRect.left + item.offsetWidth / 2 - selectedDropdownWidth / 2;
                        const dropdownFooterHeight =
                            this.calcDropdownFooterHeight(selectedDropdown);

                        this.updateDropdown(
                            selectedDropdown,
                            selectedDropdownHeight,
                            selectedDropdownWidth,
                            selectedDropdownLeft,
                            dropdownFooterHeight
                        );

                        selectedDropdown.classList.add(this.dropActiveClass);
                        selectedDropdown.classList.remove("move-left", "move-right");

                        const siblings = Array.from(this.dropdownItems);
                        siblings.forEach((sibling, index) => {
                            if (sibling !== selectedDropdown) {
                                sibling.classList.remove(this.dropActiveClass);
                                sibling.classList.add(
                                    sibling.compareDocumentPosition(selectedDropdown) === 4
                                        ? "move-left"
                                        : "move-right"
                                );
                            } else {
                                this.openDropdownIndex = index;
                            }
                        });
                        this.#initAttributes();
                        this.positionElements(this.openDropdownIndex);

                        const navItems = Array.from(this.mainNavigationItems);
                        const selectedIndex = navItems.indexOf(item);
                        navItems.forEach((navItem, index) => {
                            if (index < selectedIndex) {
                                navItem.classList.remove(this.navActiveClass);
                            } else if (index > selectedIndex) {
                                navItem.classList.remove(this.navActiveClass);
                            }
                        });

                        item.classList.add(this.navActiveClass);

                        if (!this.element.classList.contains(this.dropVisibleClass)) {
                            setTimeout(() => {
                                this.element.classList.add(this.dropVisibleClass);
                            }, 10);
                        }
                    }
                }
            };

            let isResizeHandlerAdded = false;
            let resizeTimeout;

            this.updateDropdown = (dropdownItem, height, width, left, dropdownFooterHeight) => {
                if (!this.dropdownList || !this.dropdownBg) return console.error();

                this.dropdownList.style.width = `${width}px`;
                this.dropdownList.style.height = `${height}px`;
                this.dropdownBg.style.transform = `scaleX(${width}) scaleY(${height})`;

                // const dropdownItemInitialWidth = +dropdownItem.style
                //     .getPropertyValue("--initial-width")
                //     .slice(0, -2);

                // if (dropdownItemInitialWidth > window.innerWidth) {
                //     dropdownItem.style.setProperty(
                //         "--initial-width",
                //         window.innerWidth -
                //             (window.innerWidth - document.documentElement.offsetWidth) +
                //             "px"
                //     );
                // }

                const dropdownContent = this.#inspectVariable(dropdownItem, this.dropContent);
                const dropFooter = this.#inspectVariable(
                    dropdownContent,
                    this.dropFooter,
                    false,
                    false,
                    false
                );

                if (dropFooter) {
                    const contentStyles = window.getComputedStyle(dropdownContent, null);
                    const contentPaddingBottom = parseInt(contentStyles.paddingBottom);
                    const footerStyles = window.getComputedStyle(dropFooter, null);
                    const footerMarginBottom = parseInt(footerStyles.marginBottom);

                    if (typeof this.dropFooterMode === "string") {
                        if (this.dropFooterMode === "height") {
                            const bodyStyles = window.getComputedStyle(this.dropdownList, null);
                            const bottom = parseInt(
                                bodyStyles.getPropertyValue("--dropdown-footer-margin-bottom")
                            );
                            const dropdownContentPaddingBottom = getComputedStyle(
                                dropdownItem
                            ).getPropertyValue("--dropdown-content-padding-bottom");

                            this.dropdownList.style.setProperty(
                                "--dropdown-content-padding-bottom",
                                dropdownContentPaddingBottom
                            );

                            const updateDropdownFooterPositions = () => {
                                if (
                                    this.cacheFooterPositions &&
                                    cachedDistances.has(dropdownItem)
                                ) {
                                    this.dropdownFooter.style.bottom =
                                        cachedDistances.get(dropdownItem) + "px";
                                    if (this.cacheFooterDebug) {
                                        console.log(
                                            "Кешированное значение:",
                                            cachedDistances.get(dropdownItem)
                                        );
                                        console.log(cachedDistances);
                                    }
                                } else {
                                    const selectedDropdownFooter = this.#inspectVariable(
                                        dropdownItem,
                                        this.dropFooter,
                                        false,
                                        false,
                                        false
                                    );
                                    const bottomRect =
                                        dropdownItem.offsetHeight -
                                        (selectedDropdownFooter.offsetTop +
                                            selectedDropdownFooter.offsetHeight);

                                    if (this.cacheFooterDebug) {
                                        console.log(
                                            "Расстояние до нижней границы родительского элемента:",
                                            bottomRect,
                                            "пикселей"
                                        );
                                    }

                                    if (this.cacheFooterPositions) {
                                        cachedDistances.set(dropdownItem, bottomRect);
                                    }

                                    this.dropdownFooter.style.bottom = bottomRect + "px";
                                }
                            };

                            updateDropdownFooterPositions();

                            const handleResize = () => {
                                if (resizeTimeout) {
                                    cancelAnimationFrame(resizeTimeout);
                                }

                                resizeTimeout = requestAnimationFrame(() => {
                                    // cachedDistances.clear();

                                    const selectedDropdownFooter = this.#inspectVariable(
                                        dropdownItem,
                                        this.dropFooter,
                                        false,
                                        false,
                                        false
                                    );

                                    const bottomRect =
                                        dropdownItem.offsetHeight -
                                        (selectedDropdownFooter.offsetTop +
                                            selectedDropdownFooter.offsetHeight);

                                    const cachedValue = cachedDistances.get(dropdownItem);
                                    if (cachedValue !== bottomRect) {
                                        cachedDistances.set(dropdownItem, bottomRect);
                                        this.dropdownFooter.style.bottom = bottomRect + "px";
                                        updateDropdownFooterPositions();
                                    }
                                });
                            };
                            handleResize();

                            if (!isResizeHandlerAdded) {
                                window.addEventListener("resize", handleResize.bind(this));
                                isResizeHandlerAdded = true;
                            }

                            // !
                            // if (this.cacheFooterPositions && cachedDistances.has(dropdownItem)) {
                            //     this.dropdownFooter.style.bottom =
                            //         cachedDistances.get(dropdownItem) + "px";
                            //     if (this.cacheFooterDebug) {
                            //         console.log(
                            //             "Кешированное значение:",
                            //             cachedDistances.get(dropdownItem)
                            //         );
                            //         console.log(cachedDistances);
                            //     }
                            // } else {
                            //     const selectedDropdownFooter = this.#inspectVariable(
                            //         dropdownItem,
                            //         this.dropFooter,
                            //         false,
                            //         false,
                            //         false
                            //     );
                            //     const bottomRect =
                            //         dropdownItem.offsetHeight -
                            //         (selectedDropdownFooter.offsetTop +
                            //             selectedDropdownFooter.offsetHeight);

                            //     if (this.cacheFooterDebug) {
                            //         console.log(
                            //             "Расстояние до нижней границы родительского элемента:",
                            //             bottomRect,
                            //             "пикселей"
                            //         );
                            //     }

                            //     if (this.cacheFooterPositions) {
                            //         cachedDistances.set(dropdownItem, bottomRect);
                            //     }

                            //     this.dropdownFooter.style.bottom = bottomRect + "px";
                            // }
                            //!----

                            // 	const bottomRect =
                            // 		dropdownItem.offsetHeight -
                            // 		(selectedDropdownFooter.offsetTop +
                            // 			selectedDropdownFooter.offsetHeight);
                            // this.dropdownFooter.style.bottom =
                            // 	cachedDistances[dropdownItem] + "px";

                            this.dropdownFooter.style.maxHeight = `${
                                dropdownFooterHeight

                                // +
                                // footerMarginBottom +
                                // contentPaddingBottom -
                                // bottom
                            }px`;
                        } else if (this.dropFooterMode === "transform") {
                            this.dropdownFooter.style.transform = `translateY(${
                                height -
                                dropdownFooterHeight -
                                contentPaddingBottom -
                                footerMarginBottom
                            }px)`;
                        }
                    }
                } else {
                    if (typeof this.dropFooterMode === "string") {
                        if (this.dropFooterMode === "height") {
                            this.dropdownFooter.style.removeProperty("max-height");
                            this.dropdownFooter.style.removeProperty("bottom");
                            this.dropdownList.style.setProperty(
                                "--dropdown-content-padding-bottom",
                                0 + "px"
                            );
                        } else if (this.dropFooterMode === "transform") {
                            this.dropdownFooter.style.removeProperty("transform");
                        }
                    }
                }
            };

            this.hideDropdown = () => {
                this.mq = this.#checkMq();
                if (this.mq == "desktop") {
                    this.element.classList.remove(this.dropVisibleClass);
                    this.mainNavigation.querySelector(".active")?.classList.remove("active");
                    this.dropdownList.querySelector(".active")?.classList.remove("active");
                    this.dropdownList.querySelectorAll(".move-left").forEach((el) => {
                        el.classList.remove("move-left");
                    });
                    this.dropdownList.querySelectorAll(".move-right").forEach((el) => {
                        el.classList.remove("move-right");
                    });

                    this.#initAttributes();
                }
            };

            this.resetDropdown = () => {
                this.mq = this.#checkMq();
                if (this.mq == "mobile") {
                    this.dropdownList.removeAttribute("style");
                }
            };
        }

        #initializeVariables() {
            const nullKeys = Object.keys(this.options).filter((key) => this.options[key] === null);

            const variableSelectors = {
                mainNavigation: {
                    elem: "element",
                    selector: this.nav,
                    paramName: "nav",
                    all: false,
                    hover: false,
                },
                mainNavigationItems: {
                    elem: "mainNavigation",
                    selector: this.navItem,
                    paramName: "navItem",
                    all: true,
                    hover: false,
                },
                dropdownList: {
                    elem: "element",
                    selector: this.dropList,
                    paramName: "dropList",
                    all: false,
                    hover: false,
                },
                dropdownItems: {
                    elem: "dropdownList",
                    selector: this.dropItem,
                    paramName: "dropItem",
                    all: true,
                    hover: false,
                },
                dropdownBg: {
                    elem: "dropdownList",
                    selector: this.dropBg,
                    paramName: "dropBg",
                    all: false,
                    hover: false,
                },
                dropdownFooter: {
                    elem: "dropdownList",
                    selector: this.dropBgFooter,
                    paramName: "dropBgFooter",
                    all: false,
                    hover: false,
                },
            };

            const errors = [];

            if (nullKeys.length > 0) {
                console.error(
                    "Null variable values in the options object:\n ",
                    nullKeys.join(", ")
                );
            }

            for (const [variableName, options] of Object.entries(variableSelectors)) {
                this[variableName] = this.#inspectVariable(
                    this[options.elem],
                    options.selector,
                    options.all,
                    options.hover
                );

                if (
                    !this[variableName] ||
                    (options.all && !options.hover && !Array.from(this[variableName]).length)
                ) {
                    errors.push(
                        `Incorrect ${variableName} variable. Check the '${options.paramName}' option.`
                    );
                }
            }

            if (errors.length > 0) {
                console.error("Errors found while initializing variables:");
                console.error(errors.join("\n  ---------\n  "));
                return;
            }

            this.#bindEvents();
        }

        #inspectVariable(el, key, all = false, hover = false, debug = true) {
            if (!key) return;

            if (typeof key !== "string") return key;

            const elements = all
                ? el.querySelectorAll(hover == false ? key : key + ":hover")
                : el.querySelector(hover == false ? key : key + ":hover");

            if (!elements) {
                if (!debug) return;
                return (
                    console.error(
                        `Cannot find elements with selector '${
                            hover == false ? key : key + ":hover"
                        }'.`
                    ),
                    null
                );
            }

            return elements;
        }

        #checkMq() {
            return window
                .getComputedStyle(this.element, "::before")
                .getPropertyValue("content")
                .replace(/'/g, "")
                .replace(/"/g, "")
                .split(", ");
        }

        #bindEvents() {
            const self = this;

            this.mainNavigationItems.forEach((item) => {
                item.addEventListener("mouseenter", (event) => {
                    self.showDropdown(item);
                });
                item.addEventListener("mouseleave", (event) => {
                    setTimeout(() => {
                        if (
                            self.#inspectVariable(this.mainNavigation, this.navItem, true, true)
                                .length == 0 &&
                            self.#inspectVariable(this.element, this.dropList, true, true).length ==
                                0
                        ) {
                            self.hideDropdown();
                        }
                    }, 50);
                });
            });

            this.dropdownList.addEventListener("mouseleave", () => {
                setTimeout(() => {
                    if (
                        self.#inspectVariable(this.mainNavigation, this.navItem, true, true)
                            .length == 0 &&
                        self.#inspectVariable(this.element, this.dropList, true, true).length == 0
                    ) {
                        self.hideDropdown();
                    }
                }, 50);
            });

            this.mainNavigationItems.forEach((item) => {
                item.addEventListener("touchstart", (event) => {
                    const selectedDropdown = self.dropdownList.querySelector(
                        "#" + item.getAttribute("data-content")
                    );
                    if (
                        !self.element.classList.contains(this.dropVisibleClass) ||
                        !selectedDropdown.classList.contains(this.dropActiveClass)
                    ) {
                        event.preventDefault();
                        this.showDropdown(item);
                    }
                });
            });

            this.element.querySelector(".header__burger").addEventListener("click", (event) => {
                event.preventDefault();
                this.element.classList.toggle("header__burger--active");
            });
        }
    }

    let morphDropdowns = [];
    const morphDropdownElements = document.querySelectorAll(".header");
    const mainnav = document.querySelector(".header__nav");
    const bg = document.querySelector(".bg-layer");
    if (morphDropdownElements.length > 0) {
        morphDropdownElements.forEach((element) => {
            morphDropdowns.push(new MorphDropdown(element, {}));
        });

        let resizing = false;

        updateDropdownPosition();
        // window.addEventListener("resize", () => {
        //     if (!resizing) {
        //         resizing = true;
        //         !window.requestAnimationFrame
        //             ? setTimeout(updateDropdownPosition, 300)
        //             : window.requestAnimationFrame(updateDropdownPosition);
        //     }
        // });

        function updateDropdownPosition() {
            morphDropdowns.forEach((element) => {
                element.resetDropdown();
            });

            resizing = false;
        }
    }
});
