const API = "http://localhost:3000";
let token = "";
const $ = id => document.getElementById(id);
const message = text => { $("message").textContent = text; };

async function signIn(credentials) {
  const response = await fetch(`${API}/api01/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  if (data.user.role !== "driver") throw new Error("Driver account required");
  token = data.accessToken;
  message(`Welcome, ${data.user.name}`);
  await loadDeliveries();
}

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await signIn(Object.fromEntries(new FormData(event.target)));
  } catch (e) { message(e.message); }
});

$("registerForm").addEventListener("submit", async event => {
  event.preventDefault();
  const submit = event.submitter;
  if (submit) submit.disabled = true;
  try {
    const response = await fetch(`${API}/api01/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");
    token = data.accessToken;
    event.target.reset();
    message(`Driver account created. Welcome, ${data.user.name}.`);
    await loadDeliveries();
  } catch (e) {
    message(e.message);
  } finally {
    if (submit) submit.disabled = false;
  }
});

async function loadDeliveries() {
  const response = await fetch(`${API}/api04/dispatch/my-deliveries`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) return message(data.error || "Could not load deliveries");

  $("deliveries").replaceChildren();
  data.forEach(order => {
    const card = document.createElement("article");
    card.className = "menu-item";

    const heading = document.createElement("h3");
    heading.textContent = `Order ${order.id}`;
    const address = document.createElement("p");
    address.textContent = order.delivery_address;
    const status = document.createElement("p");
    status.textContent = `Status: ${order.status}`;

    card.append(heading, address, status);

    const next = {
      assigned: "picked_up",
      picked_up: "delivered"
    }[order.status];

    if (next) {
      const button = document.createElement("button");
      button.textContent = `Mark ${next.replace("_", " ")}`;
      button.addEventListener("click", async () => {
        const result = await fetch(
          `${API}/api04/dispatch/${order.id}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: next })
          }
        );
        if (!result.ok) {
          const error = await result.json();
          return message(error.error || "Update failed");
        }
        message("Delivery updated.");
        loadDeliveries();
      });
      card.append(button);
    }

    $("deliveries").append(card);
  });
}
app.get("/api04/dispatch/my-deliveries", authenticate,
  allow("driver"),
  asyncRoute(async (req, res) => {
    const result = await tenantQuery(req, client =>
      client.query(
        `SELECT id,delivery_address,status,created_at
         FROM orders
         WHERE driver_id=$1
         ORDER BY created_at DESC`,
        [req.auth.sub]
      )
    );
    res.json(result.rows);
  })
);