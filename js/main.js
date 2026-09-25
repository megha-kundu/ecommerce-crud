const API = "http://localhost/ecommerce-crud/php-api";

let allProducts = [];

/* =========================
   PEXELS IMAGE SETTINGS
========================= */

const PEXELS_API = API + "/pexels.php";

const IMAGE_CACHE_KEY = "fashionhub_pexels_cache_v1";

// Image ko 24 hours tak cache rakhenge
const IMAGE_CACHE_TIME = 24 * 60 * 60 * 1000;

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600";


/* =========================
   IMAGE CACHE
========================= */

function getImageCache() {

    try {

        return JSON.parse(
            localStorage.getItem(IMAGE_CACHE_KEY) || "{}"
        );

    } catch (error) {

        console.error("Pexels cache read error:", error);

        return {};
    }
}


function saveImageCache(cache) {

    try {

        localStorage.setItem(
            IMAGE_CACHE_KEY,
            JSON.stringify(cache)
        );

    } catch (error) {

        console.error("Pexels cache save error:", error);
    }
}


function getCachedPexelsImage(query) {

    const cache = getImageCache();

    const item = cache[query];

    if (!item) {
        return null;
    }

    // 24 hours ke baad old cache delete
    if (
        Date.now() - Number(item.time || 0)
        > IMAGE_CACHE_TIME
    ) {

        delete cache[query];

        saveImageCache(cache);

        return null;
    }

    return item;
}


/* =========================
   GET PEXELS IMAGE
========================= */

async function getPexelsImage(product) {

    const name =
        product.name ??
        product.product_name ??
        "fashion product";


    const category =
        product.category ??
        product.product_category ??
        "";


    /*
     * Product name + category se search query banegi
     *
     * Example:
     * Running Shoes + Footwear
     * →
     * running shoes footwear
     */

    const query =
        `${name} ${category}`
            .trim()
            .toLowerCase();


    /*
     * Pehle browser cache check karo
     */

    const cached =
        getCachedPexelsImage(query);


    if (
        cached &&
        cached.image
    ) {

        return cached;
    }


    try {

        /*
         * PHP ke through Pexels API call
         */

        const response =
            await fetch(
                PEXELS_API +
                "?query=" +
                encodeURIComponent(query)
            );


        if (!response.ok) {

            throw new Error(
                "Pexels HTTP Error: " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "Pexels response for:",
            query,
            data
        );


        /*
         * Pexels se image mili
         */

        if (
            data &&
            data.success &&
            Array.isArray(data.data) &&
            data.data.length > 0
        ) {

            const result =
                data.data[0];


            const imageData = {

                image:
                    result.image || "",

                photographer:
                    result.photographer ||
                    "Pexels",

                photographer_url:
                    result.photographer_url ||
                    "",

                pexels_url:
                    result.pexels_url ||
                    "",

                time:
                    Date.now()
            };


            /*
             * Image cache me save
             */

            const cache =
                getImageCache();


            cache[query] =
                imageData;


            saveImageCache(cache);


            return imageData;
        }


    } catch (error) {

        console.error(
            "Pexels image error:",
            error
        );
    }


    /*
     * Agar Pexels se image nahi mili
     */

    return {

        image: "",

        photographer: "",

        photographer_url: "",

        pexels_url: ""
    };
}


/* =========================
   CHECK DATABASE IMAGE
========================= */

function hasUsableImage(product) {

    const image =
        product.image ??
        product.image_url ??
        product.product_image ??
        "";


    return String(image).trim() !== "";
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    const productGrid =
        document.getElementById(
            "productGrid"
        );


    if (!productGrid) {

        console.error(
            "productGrid nahi mila."
        );

        return;
    }


    productGrid.innerHTML = `
        <p class="empty">
            Loading products...
        </p>
    `;


    try {

        const response =
            await fetch(
                API + "/products.php"
            );


        console.log(
            "API Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "Products Response:",
            data
        );


        /*
         * API response handle
         */

        if (Array.isArray(data)) {

            allProducts = data;

        }

        else if (
            Array.isArray(
                data.products
            )
        ) {

            allProducts =
                data.products;

        }

        else if (
            Array.isArray(
                data.data
            )
        ) {

            allProducts =
                data.data;

        }

        else {

            allProducts = [];
        }


        /*
         * Products display
         */

        displayProducts(
            allProducts
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productGrid.innerHTML = `
            <p class="empty">

                ❌ Products load nahi ho rahe.

                <br><br>

                Please check PHP server and database.

                <br><br>

                <button onclick="loadProducts()">
                    Try Again
                </button>

            </p>
        `;
    }
}


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {

    const productGrid =
        document.getElementById(
            "productGrid"
        );


    if (!productGrid) {
        return;
    }


    if (
        !products ||
        products.length === 0
    ) {

        productGrid.innerHTML = `
            <p class="empty">
                No products found.
            </p>
        `;

        return;
    }


    productGrid.innerHTML = "";


    products.forEach(product => {


        /* =========================
           PRODUCT DATA
        ========================= */

        const id =
            product.id ??
            product.product_id ??
            "";


        const name =
            product.name ??
            product.product_name ??
            "Product";


        const price =
            product.price ??
            product.product_price ??
            0;


        const category =
            product.category ??
            product.product_category ??
            "";


        const description =
            product.description ??
            product.product_description ??
            "";


        /*
         * Database image
         */
const databaseImage =
    (product.image && product.image.trim() !== "")
        ? product.image
        : (product.image_url && product.image_url.trim() !== "")
            ? product.image_url
            : (product.product_image && product.product_image.trim() !== "")
                ? product.product_image
                : "";

        /*
         * Agar database me image hai
         * to database image use hogi.
         *
         * Agar blank hai to pehle default
         * image show hogi aur Pexels image
         * background me load hogi.
         */

        const image =
            String(databaseImage).trim()
                ? databaseImage
                : DEFAULT_IMAGE;


        /* =========================
           CREATE CARD
        ========================= */

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "product-card";


        card.dataset.productId =
            id;


        card.innerHTML = `

           <div class="product-image">
    <img
        class="product-img"
        src="${escapeHTML(image)}"
        alt="${escapeHTML(name)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';"
    >
</div>

                <!-- Pexels Credit -->

                <div
                    class="pexels-credit"
                    data-credit-id="${escapeHTML(id)}"
                    style="
                        display:none;
                        position:absolute;
                        left:8px;
                        bottom:8px;
                        padding:5px 8px;
                        background:rgba(0,0,0,.65);
                        color:#fff;
                        border-radius:5px;
                        font-size:11px;
                        line-height:1.3;
                        z-index:2;
                    "
                ></div>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(category)}
                </span>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(description)}
                </p>


                <div class="product-bottom">

                    <strong>
                        ₹${Number(price).toLocaleString("en-IN")}
                    </strong>


                    <button
                        class="add-cart-btn"
                        onclick="addToCart(${Number(id)})"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>
        `;


        productGrid.appendChild(card);


        /*
         * Agar DB image blank hai,
         * Pexels se image lao.
         */

        if (
            !hasUsableImage(product)
        ) {

            loadProductPexelsImage(
                product,
                card
            );
        }

    });
}


/* =========================
   LOAD PEXELS IMAGE FOR CARD
========================= */

async function loadProductPexelsImage(
    product,
    card
) {

    try {

        const result =
            await getPexelsImage(
                product
            );


        /*
         * Image nahi mili
         */

        if (
            !result ||
            !result.image
        ) {

            return;
        }


        /*
         * Product image element
         */

        const imageElement =
            card.querySelector(
                ".product-img"
            );


        if (imageElement) {

            imageElement.src =
                result.image;


            imageElement.onerror =
                function () {

                    this.src =
                        DEFAULT_IMAGE;
                };
        }


        /*
         * Pexels credit
         */

        const creditElement =
            card.querySelector(
                ".pexels-credit"
            );


        if (creditElement) {

            const photographer =
                escapeHTML(
                    result.photographer ||
                    "Pexels"
                );


            const photographerURL =
                escapeHTML(
                    result.photographer_url ||
                    result.pexels_url ||
                    "https://www.pexels.com/"
                );


            const photoURL =
                escapeHTML(
                    result.pexels_url ||
                    "https://www.pexels.com/"
                );


            creditElement.innerHTML = `

                Photo by

                <a
                    href="${photographerURL}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        color:#fff;
                        text-decoration:underline;
                    "
                >
                    ${photographer}
                </a>

                on

                <a
                    href="${photoURL}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        color:#fff;
                        text-decoration:underline;
                    "
                >
                    Pexels
                </a>

            `;


            creditElement.style.display =
                "block";
        }


    } catch (error) {

        console.error(
            "Unable to load product image:",
            error
        );
    }
}


/* =========================
   SEARCH
========================= */

function searchProducts(value) {

    const keyword =
        String(value || "")
            .toLowerCase()
            .trim();


    /*
     * Search empty hai
     */

    if (keyword === "") {

        displayProducts(
            allProducts
        );

        return;
    }


    /*
     * Products filter
     */

    const filtered =
        allProducts.filter(
            product => {


                const name =
                    product.name ??
                    product.product_name ??
                    "";


                const category =
                    product.category ??
                    product.product_category ??
                    "";


                const description =
                    product.description ??
                    product.product_description ??
                    "";


                return (

                    String(name)
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    String(category)
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    String(description)
                        .toLowerCase()
                        .includes(keyword)

                );

            }
        );


    displayProducts(
        filtered
    );
}


/* =========================
   CATEGORY FILTER
========================= */

function filterCategory(
    category,
    button
) {


    /*
     * Active button change
     */

    document
        .querySelectorAll(
            ".cat-chip"
        )
        .forEach(
            chip => {

                chip.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );
    }


    /*
     * All category
     */

    if (
        !category ||
        category.toLowerCase() ===
        "all"
    ) {

        displayProducts(
            allProducts
        );

        return;
    }


    /*
     * Category filtering
     */

    const filtered =
        allProducts.filter(
            product => {


                const productCategory =
                    product.category ??
                    product.product_category ??
                    "";


                return String(
                    productCategory
                )
                    .toLowerCase()
                    .trim() ===

                    String(category)
                        .toLowerCase()
                        .trim();

            }
        );


    displayProducts(
        filtered
    );
}


/* =========================
   ADD TO CART
========================= */

function addToCart(productId) {

    const product =
        allProducts.find(
            item => {

                const id =
                    item.id ??
                    item.product_id;


                return String(id) ===
                    String(productId);

            }
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;
    }


    let cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            ) || "[]"
        );


    const id =
        product.id ??
        product.product_id;


    const existing =
        cart.find(
            item => {

                const itemId =
                    item.id ??
                    item.product_id;


                return String(itemId) ===
                    String(id);

            }
        );


    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 1
            ) + 1;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });
    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    showToast(
        "Product added to cart 🛒"
    );


    updateCartCount();
}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            ) || "[]"
        );


    const count =
        cart.reduce(
            (
                total,
                item
            ) => {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.textContent =
            count;
    }
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        alert(message);

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );
}


/* =========================
   LOGIN STATUS
========================= */

function updateLoginStatus() {

    const navAuth =
        document.getElementById(
            "navAuth"
        );


    if (!navAuth) {
        return;
    }


    const user =
        localStorage.getItem(
            "user"
        );


    /*
     * User logged out
     */

    if (!user) {

        navAuth.innerHTML = `

            <a
                href="login.html"
                class="btn-login"
            >
                Login
            </a>

        `;

        return;
    }


    let userName =
        "Account";


    try {

        const userData =
            JSON.parse(user);


        userName =
            userData.name ||
            userData.username ||
            userData.email ||
            "Account";


    } catch (error) {

        userName =
            user;
    }


    navAuth.innerHTML = `

        <span class="user-name">
            Hi, ${escapeHTML(userName)}
        </span>


        <button
            class="btn-login"
            onclick="logout()"
        >
            Logout
        </button>

    `;
}


/* =========================
   LOGOUT
========================= */

function logout() {

    localStorage.removeItem(
        "user"
    );


    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "loggedInUser"
    );


    window.location.href =
        "login.html";
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        updateLoginStatus();

        loadProducts();

    }
);