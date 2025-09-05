document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#branchHeadTableBody");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.querySelector("#branchHeadSearch");

  let allHeads = [];
  let currentIndex = 0;
  const batchSize = 10;
  let isLoading = false;
  let currentStatus = "all";

  const spinner = document.createElement("div");
  spinner.textContent = "Loading…";
  spinner.style.textAlign = "center";
  spinner.style.padding = "10px";
  spinner.style.display = "none";
  tableBody.parentNode.appendChild(spinner);

  function renderNextBatch() {
    if (isLoading) return;
    isLoading = true;
    spinner.style.display = "block";

    setTimeout(() => {
      const nextBatch = allHeads.slice(currentIndex, currentIndex + batchSize);
      nextBatch.forEach((head, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="Sr no.">${currentIndex + index + 1}</td>
          <td data-label="Name">${head.name}</td>
          <td data-label="Age">${head.age}</td>
          <td data-label="Gender">${head.gender}</td>
          <td data-label="Branch">${head.branch_name ?? "—"}</td>
          <td data-label="Action" class="ta-right">
            <a href="/head/admins/${head.admin_id}" class="btn btn-sm btn-primary">View</a>
          </td>
        `;
        tableBody.appendChild(row);
      });

      currentIndex += batchSize;
      isLoading = false;
      spinner.style.display = "none";
    }, 1000);
  }

  async function fetchBranchHeads(status = "all", search = "") {
    try {
      currentStatus = status;
      currentIndex = 0;
      tableBody.innerHTML = "";

      let url = `/head/api/branch_heads?status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      allHeads = await res.json();

      if (!allHeads.length) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No branch heads found</td></tr>`;
        return;
      }

      renderNextBatch();
    } catch (err) {
      console.error("Error fetching branch heads:", err);
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      fetchBranchHeads(btn.dataset.status, searchInput.value.trim());
    });
  });

  searchInput.addEventListener("input", () => {
    fetchBranchHeads(currentStatus, searchInput.value.trim());
  });

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      if (currentIndex < allHeads.length) renderNextBatch();
    }
  });

  // Initial load
  fetchBranchHeads("all");
});
