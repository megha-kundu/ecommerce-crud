// ============================================
// FASHIONHUB ADMIN.JS
// ============================================

const API = "http://localhost/ecommerce-crud/php-api";

const PEXELS_API = API + "/pexels.php";

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80";


// ============================================
// IMAGE CACHE
// ============================================

const IMAGE_CACHE_KEY = "fashionhub_pexels_cache_v1";

let imageCache = {};

try {
    imageCache =
        JSON.parse(
            localStorage.getItem(IMAGE_CACHE_KEY) || "{}"
        );
} catch (error) {
    imageCache = {};
}


// ============================================
// PRODUCTS
// ============================================

let allProducts = [];


// ============================================
// PAGE LOAD
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    const adminName =
        document.getElementById("adminName");

    if (adminName) {

        const savedName =
            localStorage.getItem("userName") ||
            localStorage.getItem("name") ||
            localStorage.getItem("username") ||
            "Admin";

        adminName.textContent = savedName;
    }

    loadProducts();
});


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

    const tableBody =
        document.getElementById("tableBody");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                `${API}/products.php?time=${Date.now()}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Server Error: " + response.status
            );
        }

        const result =
            await response.json();

        console.log(
            "Products:",
            result
        );

        if (!result.success) {

            throw new Error(
                result.message ||
                "Products load nahi hue"
            );
        }

        allProducts =
            Array.isArray(result.data)
                ? result.data
                : [];

        updateStats(allProducts);

        await renderProducts(allProducts);

    } catch (error) {

        console.error(
            "Load Products Error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    ❌ Products load nahi ho rahe
                    <br>
                    <small>
                        ${escapeHTML(error.message)}
                    </small>
                </td>
            </tr>
        `;

        showToast(
            "Products load nahi ho rahe",
            "error"
        );
    }
}


// ============================================
// GET PRODUCT IMAGE
// ============================================

async function getProductImage(product) {

    // ----------------------------------------
    // 1. DATABASE IMAGE
    // ----------------------------------------

    const databaseImage =
        product.image ||
        product.image_url ||
        product.product_image ||
        "";

    if (
        typeof databaseImage === "string" &&
        databaseImage.trim() !== ""
    ) {

        return databaseImage.trim();
    }


    // ----------------------------------------
    // 2. SEARCH QUERY
    // ----------------------------------------

    const name =
        String(product.name || "").trim();

    const category =
        String(product.category || "").trim();

    if (!name) {
        return DEFAULT_IMAGE;
    }


    /*
       Same type of query as storefront:

       Running Shoes + Footwear
       Formal Shirt + Men
       Floral Maxi Dress + Women
    */

    const query =
        `${name} ${category}`.trim();


    // ----------------------------------------
    // 3. CACHE CHECK
    // ----------------------------------------

    const cacheKey =
        query.toLowerCase();


    if (imageCache[cacheKey]) {

        return imageCache[cacheKey].image;
    }


    // ----------------------------------------
    // 4. PEXELS API
    // ----------------------------------------

    try {

        const url =
            `${PEXELS_API}?query=${encodeURIComponent(query)}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Pexels HTTP " +
                response.status
            );
        }


        const result =
            await response.json();


        if (
            result.success &&
            Array.isArray(result.data) &&
            result.data.length > 0
        ) {

            const image =
                result.data[0].image;


            if (image) {

                imageCache[cacheKey] = {

                    image: image,

                    time: Date.now()

                };


                localStorage.setItem(
                    IMAGE_CACHE_KEY,
                    JSON.stringify(imageCache)
                );


                return image;
            }
        }

    } catch (error) {

        console.error(
            "Pexels image error:",
            error
        );
    }


    // ----------------------------------------
    // 5. DEFAULT IMAGE
    // ----------------------------------------

    return DEFAULT_IMAGE;
}


// ============================================
// RENDER PRODUCTS
// ============================================

async function renderProducts(products) {

    const tableBody =
        document.getElementById("tableBody");

    if (!tableBody) return;


    if (
        !products ||
        products.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    📦 No products found
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Loading product images...
            </td>
        </tr>
    `;


    // ----------------------------------------
    // GET ALL IMAGES
    // ----------------------------------------

    const rows =
        await Promise.all(

            products.map(
                async function (product) {

                    const image =
                        await getProductImage(
                            product
                        );


                    const id =
                        Number(product.id) || 0;


                    const name =
                        product.name ||
                        "Unnamed Product";


                    const brand =
                        product.brand ||
                        "";


                    const price =
                        Number(product.price) || 0;


                    const mrp =
                        Number(product.mrp) || 0;


                    const category =
                        product.category ||
                        "Uncategorized";


                    return `

                        <tr>

                            <!-- ID -->

                            <td>
                                <strong>
                                    #${id}
                                </strong>
                            </td>


                            <!-- IMAGE -->

                            <td>

                                <div
                                    class="admin-product-image"
                                    style="
                                        width:70px;
                                        height:70px;
                                        overflow:hidden;
                                        border-radius:10px;
                                        background:#f5f5f5;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                    "
                                >

                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(name)}"
                                        loading="lazy"

                                        style="
                                            width:100%;
                                            height:100%;
                                            object-fit:cover;
                                            object-position:center;
                                            display:block;
                                        "

                                        onerror="
                                            this.onerror=null;
                                            this.src='${DEFAULT_IMAGE}';
                                        "
                                    >

                                </div>

                            </td>


                            <!-- PRODUCT -->

                            <td>

                                <div
                                    class="admin-product-name"
                                >

                                    <strong>
                                        ${escapeHTML(name)}
                                    </strong>

                                    ${
                                        brand
                                            ? `
                                                <small>
                                                    ${escapeHTML(brand)}
                                                </small>
                                              `
                                            : ""
                                    }

                                </div>

                            </td>


                            <!-- PRICE -->

                            <td>

                                <strong>
                                    ₹${formatPrice(price)}
                                </strong>

                                ${
                                    mrp > price
                                        ? `
                                            <small
                                                class="admin-mrp"
                                            >
                                                ₹${formatPrice(mrp)}
                                            </small>
                                          `
                                        : ""
                                }

                            </td>


                            <!-- CATEGORY -->

                            <td>

                                <span
                                    class="admin-category"
                                >
                                    ${escapeHTML(category)}
                                </span>

                            </td>


                            <!-- ACTIONS -->

                            <td>

                                <div
                                    class="admin-actions"
                                >

                                    <button
                                        class="btn-edit"
                                        onclick="editProduct(${id})"
                                    >
                                        ✏️ Edit
                                    </button>


                                    <button
                                        class="btn-delete"
                                        onclick="deleteProduct(${id})"
                                    >
                                        🗑️ Delete
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;
                }
            )
        );


    tableBody.innerHTML =
        rows.join("");
}


// ============================================
// STATS
// ============================================

function updateStats(products) {

    const total =
        document.getElementById("statTotal");

    if (total) {

        total.textContent =
            products.length;
    }


    const value =
        document.getElementById("statValue");

    if (value) {

        const inventory =
            products.reduce(
                function (sum, product) {

                    return sum +
                        Number(product.price || 0);

                },
                0
            );


        value.textContent =
            "₹" +
            formatPrice(inventory);
    }


    const cats =
        document.getElementById("statCats");

    if (cats) {

        const categorySet =
            new Set();


        products.forEach(
            function (product) {

                if (
                    product.category &&
                    String(product.category).trim()
                ) {

                    categorySet.add(
                        String(
                            product.category
                        ).trim()
                    );
                }

            }
        );


        cats.textContent =
            categorySet.size;
    }
}


// ============================================
// SEARCH
// ============================================

function searchTable(value) {

    const search =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!search) {

        renderProducts(allProducts);

        return;
    }


    const filtered =
        allProducts.filter(
            function (product) {

                const text = [

                    product.id,
                    product.name,
                    product.brand,
                    product.category,
                    product.description,
                    product.price

                ]
                    .join(" ")
                    .toLowerCase();


                return text.includes(search);
            }
        );


    renderProducts(filtered);
}


// ============================================
// ADD PRODUCT
// ============================================

function openAdd() {
    window.location.href = "add-product.html";
}


// ============================================
// CLOSE MODAL
// ============================================

function closeModal() {

    const modal =
        document.getElementById("modalBg");

    if (modal) {

        modal.classList.remove("show");
    }
}


// ============================================
// EDIT PRODUCT
// ============================================

function editProduct(id) {
    window.location.href =
        "edit-product.html?id=" + encodeURIComponent(id);
}

// ============================================
// SAVE PRODUCT
// ============================================

async function saveProduct(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "productId"
        ).value.trim();


    const name =
        document.getElementById(
            "pName"
        ).value.trim();


    const brand =
        document.getElementById(
            "pBrand"
        ).value.trim();


    const category =
        document.getElementById(
            "pCategory"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "pPrice"
            ).value
        );


    const mrp =
        Number(
            document.getElementById(
                "pMrp"
            ).value
        ) || 0;


    const image =
        document.getElementById(
            "pImage"
        ).value.trim();


    const description =
        document.getElementById(
            "pDesc"
        ).value.trim();


    if (!name) {

        showToast(
            "Product name required",
            "error"
        );

        return;
    }


    if (!price || price <= 0) {

        showToast(
            "Valid price enter karo",
            "error"
        );

        return;
    }


    const productData = {

        name: name,

        brand: brand,

        price: price,

        mrp: mrp,

        category: category,

        image: image,

        description: description

    };


    try {

        let response;


        // UPDATE

        if (id) {

            productData.id =
                Number(id);


            response =
                await fetch(
                    `${API}/products.php`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                productData
                            )
                    }
                );

        }

        // ADD

        else {

            response =
                await fetch(
                    `${API}/products.php`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                productData
                            )
                    }
                );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Save failed"
            );
        }


        closeModal();


        showToast(
            id
                ? "✅ Product updated successfully"
                : "✅ Product added successfully",
            "success"
        );


        await loadProducts();

    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message ||
            "Something went wrong",
            "error"
        );
    }
}


// ============================================
// DELETE
// ============================================

async function deleteProduct(id) {

    const product =
        allProducts.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    const name =
        product?.name ||
        "this product";


    if (
        !confirm(
            `Are you sure you want to delete "${name}"?`
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/products.php`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            id: Number(id)
                        })
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Delete failed"
            );
        }


        showToast(
            "🗑️ Product deleted successfully",
            "success"
        );


        await loadProducts();

    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message ||
            "Delete failed",
            "error"
        );
    }
}


// ============================================
// LOGOUT
// ============================================

function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    window.location.href =
        "login.html";
}


// ============================================
// TOAST
// ============================================

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.className =
        "toast show " + type;


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );
}


// ============================================
// PRICE FORMAT
// ============================================

function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );
}


// ============================================
// HTML ESCAPE
// ============================================

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


// ============================================
// CLOSE MODAL OUTSIDE CLICK
// ============================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "modalBg"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeModal();
        }
    }
);