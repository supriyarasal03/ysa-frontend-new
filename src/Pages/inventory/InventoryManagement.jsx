import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getAllInventory,
  searchInventory,
  updateInventory,
  receiveStock,
  updateInventoryStatus,
} from "./inventoryApi";

import AddInventory from "./AddInventory";

// ==========================================================
// SMALL PRESENTATION HELPERS (no business logic)
// ==========================================================

const formatINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const ErrorText = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs font-medium text-red-600">
      {error}
    </p>
  );
};

const StockBadge = ({ item }) => (
  <span
    className={`inline-flex min-w-[45px] justify-center rounded-full px-3 py-1.5 text-sm font-bold ${
      item.stockStatus === "OUT_OF_STOCK"
        ? "bg-[#ffe5e8] text-[#dd2946]"
        : item.stockStatus === "LOW_STOCK"
        ? "bg-[#fff2df] text-[#d67b00]"
        : "bg-[#e8f9f0] text-[#0a9a5b]"
    }`}
  >
    {item.currentStock}
  </span>
);

const StatusBadge = ({ item }) => (
  <span
    className={`inline-flex min-w-[82px] justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${
      item.status === "ACTIVE"
        ? "bg-[#e7faef] text-[#069a5a]"
        : "bg-[#ffe8eb] text-[#d72d45]"
    }`}
  >
    {item.status === "ACTIVE" ? "Active" : "Inactive"}
  </span>
);

const selectClass =
  "h-12 w-full rounded-xl border border-[#d5e0eb] bg-white px-4 text-[15px] text-[#344b66] outline-none focus:border-[#0787c8] disabled:cursor-not-allowed disabled:bg-[#f3f6f9] disabled:text-[#9aaabd]";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-[#415d79]";

const outlineBtn =
  "h-11 rounded-xl border border-[#d5e0eb] bg-white px-5 font-semibold text-[#536b86] transition hover:bg-[#f7fafc]";

const InventoryManagement = () => {

  // ==========================================================
  // INVENTORY DATA
  // ==========================================================

  const [inventory, setInventory] = useState([]);

  // Complete inventory.
  // Used for cascading Sport -> Sub Item -> Brand.
  const [allInventory, setAllInventory] = useState([]);

  // ==========================================================
  // INVENTORY FILTERS
  // ==========================================================

  const [sportId, setSportId] = useState("");
  const [subItem, setSubItem] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");

  // ==========================================================
  // VIEW MODE
  // ==========================================================

  // INVENTORY = inventory management filters
  // COST = cost price analysis filters and summary
  const [viewMode, setViewMode] =
    useState("INVENTORY");

  // ==========================================================
  // COST DATE FILTERS
  // ==========================================================

  const [costDateType, setCostDateType] =
    useState("ALL");

  const [costDate, setCostDate] =
    useState("");

  const [costFromDate, setCostFromDate] =
    useState("");

  const [costToDate, setCostToDate] =
    useState("");

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [pageError, setPageError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // ADD FORM
  // ==========================================================

  const [showAddForm, setShowAddForm] =
    useState(false);

  // ==========================================================
  // VIEW / MANAGE
  // ==========================================================

  const [viewItem, setViewItem] =
    useState(null);

  const [manageItem, setManageItem] =
    useState(null);

  // ==========================================================
  // MANAGE FORM
  // ==========================================================

  const [receivedQuantity, setReceivedQuantity] =
    useState("");

  const [costPrice, setCostPrice] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  const [lowStockAlert, setLowStockAlert] =
    useState("");

  const [manageErrors, setManageErrors] =
    useState({});

  const [manageLoading, setManageLoading] =
    useState(false);

  // ==========================================================
  // MANAGE FORM REFS
  // ==========================================================

  const receivedQuantityRef =
    useRef(null);

  const costPriceRef =
    useRef(null);

  const sellingPriceRef =
    useRef(null);

  const lowStockAlertRef =
    useRef(null);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] =
    useState(1);

  // ==========================================================
  // STATUS MODAL
  // ==========================================================

  const [statusConfirmItem, setStatusConfirmItem] =
    useState(null);

  const [statusConfirmAction, setStatusConfirmAction] =
    useState("");

  const [statusActionLoading, setStatusActionLoading] =
    useState(false);

  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {

    setLoading(true);
    setPageError("");

    try {

      const response =
        await getAllInventory();

      const data =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setAllInventory(data);
      setInventory(data);

      setCurrentPage(1);

    } catch (error) {

      setPageError(
        error?.response?.data?.message ||
          "Unable to load inventory."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================================
  // SEARCH / INVENTORY FILTER
  // ==========================================================

  useEffect(() => {

    if (viewMode !== "INVENTORY") {
      return;
    }

    setCurrentPage(1);

    const timer =
      setTimeout(() => {

        performSearch();

      }, 400);

    return () =>
      clearTimeout(timer);

  }, [
    viewMode,
    sportId,
    subItem,
    brand,
    status,
  ]);

  const performSearch = async () => {

    try {

      setSearchLoading(true);
      setPageError("");

      const response =
        await searchInventory({

          sportId:
            sportId || "",

          subItem:
            subItem || "",

          brand:
            brand || "",

          status:
            status || "",

        });

      const data =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setInventory(data);
      setCurrentPage(1);

    } catch (error) {

      setPageError(
        error?.response?.data?.message ||
          "Unable to search inventory."
      );

    } finally {

      setSearchLoading(false);

    }
  };

  // ==========================================================
  // SPORT OPTIONS
  // ==========================================================

  const sportOptions = useMemo(() => {

    const map = new Map();

    allInventory.forEach((item) => {

      if (
        item?.sportId &&
        item?.sportName
      ) {

        map.set(
          String(item.sportId),
          item.sportName
        );

      }

    });

    return Array.from(
      map.entries()
    )
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(
          b.name
        )
      );

  }, [allInventory]);

  // ==========================================================
  // SUB ITEM OPTIONS
  // SPORT MUST BE SELECTED FIRST
  // ==========================================================

  const subItemOptions = useMemo(() => {

    if (!sportId) {
      return [];
    }

    const source =
      allInventory.filter(
        (item) =>
          String(item?.sportId) ===
          String(sportId)
      );

    return [
      ...new Set(
        source
          .map(
            (item) =>
              item?.subItem
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );

  }, [
    allInventory,
    sportId,
  ]);

  // ==========================================================
  // BRAND OPTIONS
  // SPORT + SUB ITEM MUST BE SELECTED FIRST
  // ==========================================================

  const brandOptions = useMemo(() => {

    if (!sportId || !subItem) {
      return [];
    }

    const source =
      allInventory.filter(
        (item) =>
          String(item?.sportId) ===
            String(sportId) &&
          String(
            item?.subItem || ""
          ).toLowerCase() ===
            String(subItem)
              .toLowerCase()
      );

    return [
      ...new Set(
        source
          .map(
            (item) =>
              item?.brand
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );

  }, [
    allInventory,
    sportId,
    subItem,
  ]);

  // ==========================================================
  // DATE HELPER
  // ==========================================================

  const getItemDate = (item) => {

    if (!item?.createdAt) {
      return null;
    }

    const date =
      new Date(
        item.createdAt
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  };

  // ==========================================================
  // COST DATE FILTER
  //
  // IMPORTANT:
  // Current Inventory entity only contains createdAt.
  // Therefore this currently filters inventory records
  // by their creation date.
  //
  // True stock-received history requires a history table.
  // ==========================================================

  const costFilteredInventory =
    useMemo(() => {

      if (
        costDateType === "ALL"
      ) {
        return inventory;
      }

      return inventory.filter(
        (item) => {

          const itemDate =
            getItemDate(item);

          if (!itemDate) {
            return false;
          }

          // DAY
          if (
            costDateType ===
            "DAY"
          ) {

            if (!costDate) {
              return true;
            }

            const selected =
              new Date(
                `${costDate}T00:00:00`
              );

            return (
              itemDate.getFullYear() ===
                selected.getFullYear() &&
              itemDate.getMonth() ===
                selected.getMonth() &&
              itemDate.getDate() ===
                selected.getDate()
            );
          }

          // MONTH
          if (
            costDateType ===
            "MONTH"
          ) {

            if (!costDate) {
              return true;
            }

            const [
              year,
              month,
            ] =
              costDate
                .split("-")
                .map(Number);

            return (
              itemDate.getFullYear() ===
                year &&
              itemDate.getMonth() ===
                month - 1
            );
          }

          // YEAR
          if (
            costDateType ===
            "YEAR"
          ) {

            if (!costDate) {
              return true;
            }

            return (
              itemDate.getFullYear() ===
              Number(costDate)
            );
          }

          // CUSTOM RANGE
          if (
            costDateType ===
            "RANGE"
          ) {

            let valid = true;

            if (costFromDate) {

              const from =
                new Date(
                  `${costFromDate}T00:00:00`
                );

              valid =
                itemDate >=
                from;
            }

            if (
              valid &&
              costToDate
            ) {

              const to =
                new Date(
                  `${costToDate}T23:59:59`
                );

              valid =
                itemDate <=
                to;
            }

            return valid;
          }

          return true;

        }
      );

    }, [
      inventory,
      costDateType,
      costDate,
      costFromDate,
      costToDate,
    ]);

  // ==========================================================
  // COST SUMMARY
  //
  // Current inventory value at cost:
  // currentStock × costPrice
  //
  // This is NOT historical received cost.
  // ==========================================================

  const totalCost =
    costFilteredInventory.reduce(
      (total, item) => {

        const stock =
          Number(
            item?.currentStock || 0
          );

        const price =
          Number(
            item?.costPrice || 0
          );

        return (
          total +
          stock * price
        );

      },
      0
    );

  const totalFilteredStock =
    costFilteredInventory.reduce(
      (total, item) =>
        total +
        Number(
          item?.currentStock || 0
        ),
      0
    );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalItems =
    costFilteredInventory.length;

  const totalStock =
    costFilteredInventory.reduce(
      (total, item) =>
        total +
        Number(
          item?.currentStock || 0
        ),
      0
    );

  const lowStock =
    costFilteredInventory.filter(
      (item) =>
        item?.stockStatus ===
        "LOW_STOCK"
    ).length;

  const outOfStock =
    costFilteredInventory.filter(
      (item) =>
        item?.stockStatus ===
        "OUT_OF_STOCK"
    ).length;

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        costFilteredInventory.length /
          ITEMS_PER_PAGE
      )
    );

  const paginatedInventory =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return costFilteredInventory.slice(
        startIndex,
        startIndex +
          ITEMS_PER_PAGE
      );

    }, [
      costFilteredInventory,
      currentPage,
    ]);

  const paginationStart =
    costFilteredInventory.length ===
    0
      ? 0
      : (
          currentPage - 1
        ) *
          ITEMS_PER_PAGE +
        1;

  const paginationEnd =
    Math.min(
      currentPage *
        ITEMS_PER_PAGE,
      costFilteredInventory.length
    );

  useEffect(() => {

    if (
      currentPage >
      totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }

  }, [
    currentPage,
    totalPages,
  ]);

  // ==========================================================
  // VIEW MODE CHANGE
  // ==========================================================

  const handleViewModeChange = (
    mode
  ) => {

    setViewMode(mode);

    setPageError("");
    setSuccessMessage("");
    setCurrentPage(1);

    // When switching to inventory management,
    // clear only cost filters.
    if (mode === "INVENTORY") {

      setCostDateType("ALL");
      setCostDate("");
      setCostFromDate("");
      setCostToDate("");

      return;
    }

    // When switching to cost analysis,
    // clear only inventory filters.
    setSportId("");
    setSubItem("");
    setBrand("");
    setStatus("");

    setInventory(
      allInventory
    );

  };

  // ==========================================================
  // CLEAR ALL FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSportId("");
    setSubItem("");
    setBrand("");
    setStatus("");

    setCostDateType("ALL");
    setCostDate("");
    setCostFromDate("");
    setCostToDate("");

    setPageError("");
    setSuccessMessage("");

    setCurrentPage(1);

    setInventory(
      allInventory
    );
  };

  // ==========================================================
  // CLEAR COST FILTER ONLY
  // ==========================================================

  const clearCostFilters = () => {

    setCostDateType("ALL");
    setCostDate("");
    setCostFromDate("");
    setCostToDate("");

    setCurrentPage(1);
  };

  // ==========================================================
  // STATUS ACTION
  // ==========================================================

  const handleStatusChange =
    (item) => {

      const newStatus =
        item.status ===
        "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      setPageError("");
      setSuccessMessage("");

      // DO NOT DEACTIVATE WHILE STOCK EXISTS
      if (
        newStatus ===
          "INACTIVE" &&
        Number(
          item.currentStock || 0
        ) > 0
      ) {

        setStatusConfirmItem(
          item
        );

        setStatusConfirmAction(
          "BLOCKED"
        );

        return;
      }

      setStatusConfirmItem(
        item
      );

      setStatusConfirmAction(
        newStatus
      );
    };

  // ==========================================================
  // CLOSE STATUS MODAL
  // ==========================================================

  const closeStatusModal = () => {

    if (
      statusActionLoading
    ) {
      return;
    }

    setStatusConfirmItem(
      null
    );

    setStatusConfirmAction(
      ""
    );
  };

  // ==========================================================
  // CONFIRM STATUS
  // ==========================================================

  const confirmStatusChange =
    async () => {

      if (
        !statusConfirmItem ||
        !statusConfirmAction ||
        statusConfirmAction ===
          "BLOCKED"
      ) {
        return;
      }

      setStatusActionLoading(
        true
      );

      setPageError("");
      setSuccessMessage("");

      try {

        await updateInventoryStatus(
          statusConfirmItem.id,
          statusConfirmAction
        );

        setSuccessMessage(
          `Inventory ${
            statusConfirmAction ===
            "ACTIVE"
              ? "activated"
              : "deactivated"
          } successfully.`
        );

        setStatusConfirmItem(
          null
        );

        setStatusConfirmAction(
          ""
        );

        await loadInitialData();

      } catch (error) {

        setPageError(
          error?.response?.data
            ?.message ||
            "Unable to change inventory status."
        );

        setStatusConfirmItem(
          null
        );

        setStatusConfirmAction(
          ""
        );

      } finally {

        setStatusActionLoading(
          false
        );

      }
    };

  // ==========================================================
  // OPEN MANAGE
  // ==========================================================

  const handleOpenManage =
    (item) => {

      setPageError("");
      setSuccessMessage("");

      setManageItem(item);

      setReceivedQuantity("");

      setCostPrice(
        item?.costPrice ??
          ""
      );

      setSellingPrice(
        item?.sellingPrice ??
          ""
      );

      setLowStockAlert(
        item?.lowStockAlert ??
          ""
      );

      setManageErrors({});
    };

  // ==========================================================
  // CLOSE MANAGE
  // ==========================================================

  const handleCloseManage =
    () => {

      if (manageLoading) {
        return;
      }

      setManageItem(null);

      setReceivedQuantity("");
      setCostPrice("");
      setSellingPrice("");
      setLowStockAlert("");

      setManageErrors({});
    };

  // ==========================================================
  // NUMBER INPUT
  // ==========================================================

  const handleNumberInput = (
    setter,
    value,
    allowDecimal = false
  ) => {

    if (allowDecimal) {

      let cleaned =
        value.replace(
          /[^0-9.]/g,
          ""
        );

      const parts =
        cleaned.split(".");

      if (
        parts.length > 2
      ) {

        cleaned =
          parts[0] +
          "." +
          parts
            .slice(1)
            .join("");

      }

      if (
        parts[1]?.length > 2
      ) {

        cleaned =
          parts[0] +
          "." +
          parts[1].substring(
            0,
            2
          );

      }

      setter(cleaned);

      return;
    }

    setter(
      value.replace(
        /[^0-9]/g,
        ""
      )
    );
  };

  // ==========================================================
  // MANAGE VALIDATION
  // ==========================================================

  const validateManageForm =
    () => {

      const errors = {};

      // RECEIVED STOCK
      if (
        receivedQuantity === "" ||
        receivedQuantity === null
      ) {

        errors.receivedQuantity =
          "New stock received is required.";

      } else if (
        !/^\d+$/.test(
          String(
            receivedQuantity
          )
        )
      ) {

        errors.receivedQuantity =
          "New stock must contain numbers only.";

      } else if (
        Number(
          receivedQuantity
        ) <= 0
      ) {

        errors.receivedQuantity =
          "New stock must be greater than zero.";

      }

      // COST PRICE
      if (
        costPrice === "" ||
        costPrice === null
      ) {

        errors.costPrice =
          "Cost price is required.";

      } else if (
        !/^\d{1,8}(\.\d{1,2})?$/.test(
          String(costPrice)
        )
      ) {

        errors.costPrice =
          "Cost price must have maximum 8 integer digits and 2 decimal digits.";

      } else if (
        Number(costPrice) <= 0
      ) {

        errors.costPrice =
          "Cost price must be greater than zero.";

      }

      // SELLING PRICE
      if (
        sellingPrice === "" ||
        sellingPrice === null
      ) {

        errors.sellingPrice =
          "Selling price is required.";

      } else if (
        !/^\d+(\.\d{1,2})?$/.test(
          String(
            sellingPrice
          )
        )
      ) {

        errors.sellingPrice =
          "Selling price must be a valid number.";

      } else if (
        Number(
          sellingPrice
        ) <= 0
      ) {

        errors.sellingPrice =
          "Selling price must be greater than zero.";

      }

      // LOW STOCK ALERT
      if (
        lowStockAlert === "" ||
        lowStockAlert === null
      ) {

        errors.lowStockAlert =
          "Low stock alert is required.";

      } else if (
        !/^\d+$/.test(
          String(
            lowStockAlert
          )
        )
      ) {

        errors.lowStockAlert =
          "Low stock alert must contain numbers only.";

      } else if (
        Number(
          lowStockAlert
        ) <= 0
      ) {

        errors.lowStockAlert =
          "Low stock alert must be greater than zero.";

      }

      setManageErrors(
        errors
      );

      if (
        Object.keys(
          errors
        ).length > 0
      ) {

        requestAnimationFrame(
          () => {

            if (
              errors.receivedQuantity
            ) {

              receivedQuantityRef
                .current
                ?.focus();

            } else if (
              errors.costPrice
            ) {

              costPriceRef
                .current
                ?.focus();

            } else if (
              errors.sellingPrice
            ) {

              sellingPriceRef
                .current
                ?.focus();

            } else if (
              errors.lowStockAlert
            ) {

              lowStockAlertRef
                .current
                ?.focus();

            }

          }
        );
      }

      return (
        Object.keys(
          errors
        ).length === 0
      );
    };

  // ==========================================================
  // MANAGE SUBMIT
  // ==========================================================

  const handleManageSubmit =
    async (event) => {

      event.preventDefault();

      setPageError("");
      setSuccessMessage("");

      if (!manageItem) {
        return;
      }

      const isValid =
        validateManageForm();

      if (!isValid) {
        return;
      }

      setManageLoading(
        true
      );

      try {

        const received =
          Number(
            receivedQuantity
          );

        // RECEIVE STOCK
        await receiveStock(
          manageItem.id,
          {
            quantity:
              received,

            costPrice:
              Number(
                costPrice
              ),

            sellingPrice:
              Number(
                sellingPrice
              ),
          }
        );

        // UPDATE COST / SELLING / LOW STOCK
        await updateInventory(
          manageItem.id,
          {
            costPrice:
              Number(
                costPrice
              ),

            sellingPrice:
              Number(
                sellingPrice
              ),

            lowStockAlert:
              Number(
                lowStockAlert
              ),
          }
        );

        setManageItem(
          null
        );

        setReceivedQuantity("");
        setCostPrice("");
        setSellingPrice("");
        setLowStockAlert("");

        setManageErrors({});

        setSuccessMessage(
          `Inventory updated successfully. ${received} new stock added.`
        );

        await loadInitialData();

      } catch (error) {

        setPageError(
          error?.response?.data
            ?.message ||
            "Unable to update inventory."
        );

      } finally {

        setManageLoading(
          false
        );

      }
    };

  // ==========================================================
  // ADD FORM
  // ==========================================================

  if (showAddForm) {

    return (
      <AddInventory

        onClose={() => {

          setShowAddForm(
            false
          );

        }}

        onSuccess={async () => {

          setShowAddForm(
            false
          );

          setSuccessMessage(
            "Inventory items added successfully."
          );

          await loadInitialData();

        }}

      />
    );
  }

  // ==========================================================
  // SHARED ACTION BUTTONS (table + mobile cards)
  // ==========================================================

  const renderActions = (item, withLabels = false) => (

    <div
      className={
        withLabels
          ? "grid grid-cols-3 gap-2"
          : "flex items-center gap-1"
      }
    >

      {/* VIEW */}

      <button
        type="button"
        title="View"
        onClick={() =>
          setViewItem(item)
        }
        className={
          withLabels
            ? "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d5e0eb] bg-white text-sm font-semibold text-[#536b86] transition active:bg-[#eef6fb]"
            : "flex h-9 w-9 items-center justify-center rounded-lg text-[#8aa1bb] transition hover:bg-[#eef6fb] hover:text-[#0787c8]"
        }
      >
        <span>👁</span>
        {withLabels && <span>View</span>}
      </button>

      {/* MANAGE */}

      <button
        type="button"
        title="Manage Stock & Price"
        onClick={() =>
          handleOpenManage(item)
        }
        disabled={
          item.status !== "ACTIVE"
        }
        className={
          withLabels
            ? "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d5e0eb] bg-white text-sm font-semibold text-[#536b86] transition active:bg-[#eef6fb] disabled:cursor-not-allowed disabled:opacity-40"
            : "flex h-9 w-9 items-center justify-center rounded-lg text-[#8aa1bb] transition hover:bg-[#eef6fb] hover:text-[#0787c8] disabled:cursor-not-allowed disabled:opacity-40"
        }
      >
        <span>✎</span>
        {withLabels && <span>Manage</span>}
      </button>

      {/* ACTIVATE / DEACTIVATE */}

      <button
        type="button"
        title={
          item.status === "ACTIVE"
            ? "Deactivate"
            : "Activate"
        }
        onClick={() =>
          handleStatusChange(item)
        }
        className={
          withLabels
            ? `flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition ${
                item.status === "ACTIVE"
                  ? "border-red-100 bg-red-50 text-red-500"
                  : "border-green-100 bg-green-50 text-green-600"
              }`
            : `flex h-9 w-9 items-center justify-center rounded-lg transition ${
                item.status === "ACTIVE"
                  ? "text-[#8aa1bb] hover:bg-red-50 hover:text-red-500"
                  : "text-[#8aa1bb] hover:bg-green-50 hover:text-green-600"
              }`
        }
      >
        <span>⏻</span>
        {withLabels && (
          <span>
            {item.status === "ACTIVE"
              ? "Disable"
              : "Enable"}
          </span>
        )}
      </button>

    </div>
  );

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="min-h-screen w-full overflow-x-hidden bg-[#f3f7fb] px-3 py-5 sm:px-6 sm:py-7 lg:px-10">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-7 md:flex-row md:items-start">

        <div>

          <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
            Inventory Management
          </h1>

          <p className="mt-1.5 text-sm text-[#66809f] sm:mt-2 sm:text-[16px]">
            Manage all sports inventory of
            Yashree Sports Academy
          </p>

        </div>

        <button
          type="button"
          onClick={() => {

            setPageError("");
            setSuccessMessage("");

            setShowAddForm(
              true
            );

          }}
          className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#0787c8] px-6 text-[16px] font-semibold text-white shadow-md transition hover:bg-[#0678b3] md:w-auto md:min-w-[220px]"
        >

          <span className="mr-2 text-xl">
            +
          </span>

          Add New Item

        </button>

      </div>

      {/* ====================================================
          SUCCESS
      ==================================================== */}

      {successMessage && (

        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 sm:mb-5 sm:text-base">

          {successMessage}

        </div>

      )}

      {/* ====================================================
          ERROR
      ==================================================== */}

      {pageError && (

        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-5 sm:text-base">

          {pageError}

        </div>

      )}

      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-7 sm:gap-5 xl:grid-cols-4">

        {/* TOTAL ITEMS */}

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#dce5ed] bg-white p-4 shadow-sm sm:min-h-[130px] sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:min-h-[155px] lg:p-7">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#dff2ff] text-xl text-[#0787c8] sm:h-[58px] sm:w-[58px] sm:rounded-[15px] sm:text-2xl">
            📦
          </div>

          <div>

            <p className="mb-1 text-[13px] text-[#66809f] sm:mb-2 sm:text-[15px]">
              Total Items
            </p>

            <h2 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              {totalItems}
            </h2>

          </div>

        </div>

        {/* TOTAL STOCK */}

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#dce5ed] bg-white p-4 shadow-sm sm:min-h-[130px] sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:min-h-[155px] lg:p-7">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#d9f8e9] text-xl text-[#0aa968] sm:h-[58px] sm:w-[58px] sm:rounded-[15px] sm:text-2xl">
            📊
          </div>

          <div>

            <p className="mb-1 text-[13px] text-[#66809f] sm:mb-2 sm:text-[15px]">
              Total Stock
            </p>

            <h2 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              {totalStock}
            </h2>

          </div>

        </div>

        {/* LOW STOCK */}

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#dce5ed] bg-white p-4 shadow-sm sm:min-h-[130px] sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:min-h-[155px] lg:p-7">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#fff1dc] text-xl text-[#e68a00] sm:h-[58px] sm:w-[58px] sm:rounded-[15px] sm:text-2xl">
            ⚠
          </div>

          <div>

            <p className="mb-1 text-[13px] text-[#66809f] sm:mb-2 sm:text-[15px]">
              Low Stock
            </p>

            <h2 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              {lowStock}
            </h2>

          </div>

        </div>

        {/* OUT OF STOCK */}

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#dce5ed] bg-white p-4 shadow-sm sm:min-h-[130px] sm:flex-row sm:items-center sm:gap-5 sm:p-6 lg:min-h-[155px] lg:p-7">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#ffe1e5] text-xl text-[#ed2847] sm:h-[58px] sm:w-[58px] sm:rounded-[15px] sm:text-2xl">
            ×
          </div>

          <div>

            <p className="mb-1 text-[13px] text-[#66809f] sm:mb-2 sm:text-[15px]">
              Out of Stock
            </p>

            <h2 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              {outOfStock}
            </h2>

          </div>

        </div>

      </div>

      {/* ====================================================
          TABLE CARD
      ==================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#dce5ed] bg-white shadow-sm">

        {/* ==================================================
            VIEW / FILTERS
        ================================================== */}

        <div className="border-b border-[#e7edf3] p-4 sm:p-7">

          {/* VIEW SELECTOR */}

          <div className="mb-5 rounded-2xl border border-[#dce5ed] bg-[#f8fafc] p-4 sm:mb-7 sm:p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#172b4d]">
                  Inventory View
                </h2>

                <p className="mt-1 text-sm text-[#7b90a7]">
                  Select the inventory information you want to manage or analyze.
                </p>

              </div>

              <div className="w-full md:w-[300px]">

                <label className={labelClass}>
                  View
                </label>

                <select
                  value={viewMode}
                  onChange={(event) =>
                    handleViewModeChange(
                      event.target.value
                    )
                  }
                  className={selectClass}
                >

                  <option value="INVENTORY">
                    Inventory Management
                  </option>

                  <option value="COST">
                    Cost & Purchase Analysis
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ==================================================
              INVENTORY MANAGEMENT FILTERS
          ================================================== */}

          {viewMode === "INVENTORY" && (

            <>

              <div className="mb-4 sm:mb-5">

                <h2 className="text-lg font-bold text-[#172b4d]">
                  Inventory Items
                </h2>

                <p className="mt-1 text-sm text-[#7b90a7]">
                  Filter inventory by sport,
                  sub item, brand and status.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* SPORT */}

                <div>

                  <label className={labelClass}>
                    Sport
                  </label>

                  <select
                    value={sportId}
                    onChange={(event) => {

                      const value =
                        event.target.value;

                      setSportId(value);
                      setSubItem("");
                      setBrand("");

                    }}
                    className={selectClass}
                  >

                    <option value="">
                      All Sports
                    </option>

                    {sportOptions.map(
                      (sport) => (

                        <option
                          key={sport.id}
                          value={sport.id}
                        >
                          {sport.name}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* SUB ITEM */}

                <div>

                  <label className={labelClass}>
                    Sub Item
                  </label>

                  <select
                    value={subItem}
                    disabled={!sportId}
                    onChange={(event) => {

                      const value =
                        event.target.value;

                      setSubItem(value);
                      setBrand("");

                    }}
                    className={selectClass}
                  >

                    <option value="">
                      {sportId
                        ? "All Sub Items"
                        : "Select Sport First"}
                    </option>

                    {subItemOptions.map(
                      (item) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* BRAND */}

                <div>

                  <label className={labelClass}>
                    Brand
                  </label>

                  <select
                    value={brand}
                    disabled={!sportId || !subItem}
                    onChange={(event) =>
                      setBrand(
                        event.target.value
                      )
                    }
                    className={selectClass}
                  >

                    <option value="">
                      {!sportId
                        ? "Select Sport First"
                        : !subItem
                        ? "Select Sub Item First"
                        : "All Brands"}
                    </option>

                    {brandOptions.map(
                      (item) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* STATUS */}

                <div>

                  <label className={labelClass}>
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
                    }
                    className={selectClass}
                  >

                    <option value="">
                      All Status
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              <div className="mt-4 flex sm:justify-end">

                <button
                  type="button"
                  onClick={clearFilters}
                  className={`${outlineBtn} w-full sm:w-auto`}
                >
                  Clear Filters
                </button>

              </div>

            </>

          )}

          {/* ==================================================
              COST / PURCHASE FILTERS
          ================================================== */}

          {viewMode === "COST" && (

            <>

              <div className="mb-4 sm:mb-5">

                <h2 className="text-lg font-bold text-[#172b4d]">
                  Cost Price Filter
                </h2>

                <p className="mt-1 text-sm text-[#7b90a7]">
                  Filter inventory cost information by day,
                  month, year or custom date range.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* PERIOD */}

                <div>

                  <label className={labelClass}>
                    Period
                  </label>

                  <select
                    value={costDateType}
                    onChange={(event) => {

                      setCostDateType(
                        event.target.value
                      );

                      setCostDate("");

                      setCostFromDate("");

                      setCostToDate("");

                    }}
                    className={selectClass}
                  >

                    <option value="ALL">
                      All Dates
                    </option>

                    <option value="DAY">
                      Day Wise
                    </option>

                    <option value="MONTH">
                      Month Wise
                    </option>

                    <option value="YEAR">
                      Year Wise
                    </option>

                    <option value="RANGE">
                      Custom Range
                    </option>

                  </select>

                </div>

                {/* DAY */}

                {costDateType ===
                  "DAY" && (

                  <div>

                    <label className={labelClass}>
                      Select Date
                    </label>

                    <input
                      type="date"
                      value={costDate}
                      onChange={(event) =>
                        setCostDate(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    />

                  </div>

                )}

                {/* MONTH */}

                {costDateType ===
                  "MONTH" && (

                  <div>

                    <label className={labelClass}>
                      Select Month
                    </label>

                    <input
                      type="month"
                      value={costDate}
                      onChange={(event) =>
                        setCostDate(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    />

                  </div>

                )}

                {/* YEAR */}

                {costDateType ===
                  "YEAR" && (

                  <div>

                    <label className={labelClass}>
                      Select Year
                    </label>

                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={costDate}
                      placeholder="2026"
                      onChange={(event) =>
                        setCostDate(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    />

                  </div>

                )}

                {/* FROM DATE */}

                {costDateType ===
                  "RANGE" && (

                  <div>

                    <label className={labelClass}>
                      From Date
                    </label>

                    <input
                      type="date"
                      value={costFromDate}
                      onChange={(event) =>
                        setCostFromDate(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    />

                  </div>

                )}

                {/* TO DATE */}

                {costDateType ===
                  "RANGE" && (

                  <div>

                    <label className={labelClass}>
                      To Date
                    </label>

                    <input
                      type="date"
                      min={
                        costFromDate ||
                        undefined
                      }
                      value={costToDate}
                      onChange={(event) =>
                        setCostToDate(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    />

                  </div>

                )}

              </div>

              <div className="mt-4 flex sm:justify-end">

                <button
                  type="button"
                  onClick={
                    clearCostFilters
                  }
                  className={`${outlineBtn} w-full sm:w-auto`}
                >
                  Clear Cost Filter
                </button>

              </div>

            </>

          )}

        </div>

        {/* ==================================================
            COST SUMMARY
        ================================================== */}

        {viewMode === "COST" && (

          <div className="border-b border-[#e7edf3] bg-white p-4 sm:p-7">

            <div className="mb-4 sm:mb-5">

              <h2 className="text-lg font-bold text-[#172b4d]">
                Cost Summary
              </h2>

              <p className="mt-1 text-sm text-[#7b90a7]">
                Current stock value calculated using cost price.
              </p>

            </div>

            {/* TOTAL COST */}

            <div className="flex sm:justify-end">

              <div className="w-full rounded-2xl border border-[#ccebdc] bg-[#f0fbf5] px-5 py-4 sm:w-auto sm:min-w-[260px] sm:px-7 sm:py-5 sm:text-right">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f8973]">
                  Total Cost
                </p>

                <p className="mt-1 break-all text-2xl font-bold text-[#078a54]">

                  ₹{formatINR(totalCost)}

                </p>

              </div>

            </div>

          </div>

        )}

        {/* ==================================================
            MOBILE LIST (cards) — shown below md
        ================================================== */}

        <div className="md:hidden">

          {loading ? (

            <div className="px-5 py-12 text-center text-[#8195aa]">
              Loading inventory...
            </div>

          ) : searchLoading ? (

            <div className="px-5 py-12 text-center text-[#8195aa]">
              Searching inventory...
            </div>

          ) : costFilteredInventory.length ===
            0 ? (

            <div className="px-5 py-12 text-center text-[#8195aa]">
              No inventory found.
            </div>

          ) : (

            <ul className="divide-y divide-[#edf1f5]">

              {paginatedInventory.map(
                (item) => (

                  <li
                    key={item.id}
                    className="p-4"
                  >

                    {/* TOP: names + status */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="truncate text-[12px] font-medium text-[#7b90a7]">
                          {item.sportName}
                        </p>

                        <h3 className="mt-0.5 break-words text-base font-semibold text-[#172b4d]">
                          {item.subItem}
                        </h3>

                        <p className="mt-0.5 break-words text-sm text-[#324b67]">
                          {item.brand}
                        </p>

                      </div>

                      <StatusBadge item={item} />

                    </div>

                    {/* PRICES + STOCK */}

                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[#f7f9fc] p-3">

                      <div>

                        <p className="text-[11px] text-[#8a9db1]">
                          Cost
                        </p>

                        <p className="mt-0.5 break-words text-[13px] font-semibold text-[#183654]">
                          ₹{formatINR(item.costPrice)}
                        </p>

                      </div>

                      <div>

                        <p className="text-[11px] text-[#8a9db1]">
                          Selling
                        </p>

                        <p className="mt-0.5 break-words text-[13px] font-semibold text-[#183654]">
                          ₹{formatINR(item.sellingPrice)}
                        </p>

                      </div>

                      <div>

                        <p className="mb-0.5 text-[11px] text-[#8a9db1]">
                          Stock
                        </p>

                        <StockBadge item={item} />

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-3">
                      {renderActions(item, true)}
                    </div>

                  </li>

                )
              )}

            </ul>

          )}

        </div>

        {/* ==================================================
            TABLE — shown from md up
        ================================================== */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full border-collapse">

            <thead className="bg-[#f8fafc]">

              <tr>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  SPORT
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  SUB ITEM
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  BRAND
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  COST PRICE
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  SELLING PRICE
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  STOCK
                </th>

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  STATUS
                </th>

                {/* IMPORTANT: ACTIONS KEPT */}

                <th className="px-5 py-5 text-left text-xs font-semibold tracking-wide text-[#55718f]">
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-14 text-center text-[#8195aa]"
                  >
                    Loading inventory...
                  </td>

                </tr>

              ) : searchLoading ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-14 text-center text-[#8195aa]"
                  >
                    Searching inventory...
                  </td>

                </tr>

              ) : costFilteredInventory.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="px-5 py-14 text-center text-[#8195aa]"
                  >
                    No inventory found.
                  </td>

                </tr>

              ) : (

                paginatedInventory.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-t border-[#edf1f5] hover:bg-[#fbfdff]"
                    >

                      <td className="px-5 py-5 text-sm text-[#324b67]">
                        {item.sportName}
                      </td>

                      <td className="px-5 py-5 text-sm font-semibold text-[#172b4d]">
                        {item.subItem}
                      </td>

                      <td className="px-5 py-5 text-sm text-[#324b67]">
                        {item.brand}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-[#324b67]">
                        ₹{formatINR(item.costPrice)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-[#324b67]">
                        ₹{formatINR(item.sellingPrice)}
                      </td>

                      <td className="px-5 py-5">
                        <StockBadge item={item} />
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge item={item} />
                      </td>

                      {/* ACTIONS — DO NOT REMOVE */}

                      <td className="px-5 py-5">
                        {renderActions(item)}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            PAGINATION
        ================================================== */}

        {!loading &&
          costFilteredInventory.length >
            0 && (

            <div className="flex flex-col gap-3 border-t border-[#e7edf3] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">

              <p className="text-center text-sm text-[#7187a0] sm:text-left">

                Showing{" "}

                <span className="font-semibold text-[#415d79]">
                  {paginationStart}
                </span>

                {" - "}

                <span className="font-semibold text-[#415d79]">
                  {paginationEnd}
                </span>

                {" "}of{" "}

                <span className="font-semibold text-[#415d79]">
                  {
                    costFilteredInventory.length
                  }
                </span>

                {" "}items

              </p>

              <div className="flex items-center justify-between gap-2 sm:justify-end">

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="h-10 rounded-lg border border-[#d5e0eb] bg-white px-4 text-sm font-semibold text-[#536b86] transition hover:bg-[#f7fafc] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="whitespace-nowrap rounded-lg bg-[#eef8ff] px-3 py-2 text-sm font-semibold text-[#0787c8] sm:px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="h-10 rounded-lg border border-[#d5e0eb] bg-white px-4 text-sm font-semibold text-[#536b86] transition hover:bg-[#f7fafc] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          )}

      </div>

      {/* ====================================================
          VIEW MODAL
      ==================================================== */}

      {viewItem && (

        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">

          <div className="relative flex max-h-[92vh] w-full max-w-[960px] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl sm:rounded-[18px]">

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between bg-[#0f172a] px-5 py-4 sm:px-7 sm:py-6">

              <div>

                <h2 className="text-lg font-bold text-white sm:text-[22px]">
                  Inventory Details
                </h2>

                <p className="mt-0.5 text-xs text-slate-300 sm:mt-1 sm:text-sm">
                  View complete inventory information
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewItem(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-white transition hover:bg-white/10"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">

              {/* INVENTORY INFORMATION */}

              <div className="mb-5 rounded-[15px] border border-[#dce5ed] bg-white sm:mb-7">

                <div className="flex items-center gap-3 border-b border-[#e7edf3] px-4 py-4 sm:gap-4 sm:px-7 sm:py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f5ff] text-lg sm:h-11 sm:w-11 sm:text-xl">
                    📦
                  </div>

                  <div>

                    <h3 className="text-[15px] font-semibold text-[#17385c] sm:text-[17px]">
                      INVENTORY INFORMATION
                    </h3>

                    <p className="mt-0.5 text-xs text-[#8295aa] sm:mt-1 sm:text-sm">
                      Basic details of this inventory item.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-5 sm:gap-x-12 sm:gap-y-7 sm:px-7 sm:py-7">

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Sport
                    </p>

                    <p className="break-words text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {viewItem.sportName ||
                        "-"}
                    </p>

                  </div>

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Sub Item
                    </p>

                    <p className="break-words text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {viewItem.subItem ||
                        "-"}
                    </p>

                  </div>

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Brand
                    </p>

                    <p className="break-words text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {viewItem.brand ||
                        "-"}
                    </p>

                  </div>

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                        viewItem.status ===
                        "ACTIVE"
                          ? "bg-[#e6f9ef] text-[#079657]"
                          : "bg-[#ffe8eb] text-[#d52d45]"
                      }`}
                    >
                      {viewItem.status ===
                      "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

              </div>

              {/* PRICING & STOCK */}

              <div className="mb-5 rounded-[15px] border border-[#dce5ed] bg-white sm:mb-7">

                <div className="flex items-center gap-3 border-b border-[#e7edf3] px-4 py-4 sm:gap-4 sm:px-7 sm:py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f8ef] text-lg sm:h-11 sm:w-11 sm:text-xl">
                    💰
                  </div>

                  <div>

                    <h3 className="text-[15px] font-semibold text-[#17385c] sm:text-[17px]">
                      PRICING & STOCK
                    </h3>

                    <p className="mt-0.5 text-xs text-[#8295aa] sm:mt-1 sm:text-sm">
                      Current pricing and stock information.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 py-5 sm:gap-x-12 sm:gap-y-7 sm:px-7 sm:py-7">

                  {/* COST */}

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Cost Price
                    </p>

                    <p className="break-words text-[16px] font-semibold text-[#183654] sm:text-[17px]">
                      ₹{formatINR(viewItem.costPrice)}
                    </p>

                  </div>

                  {/* SELLING */}

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Selling Price
                    </p>

                    <p className="break-words text-[16px] font-semibold text-[#183654] sm:text-[17px]">
                      ₹{formatINR(viewItem.sellingPrice)}
                    </p>

                  </div>

                  {/* STOCK */}

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Current Stock
                    </p>

                    <p className="text-[16px] font-semibold text-[#183654] sm:text-[17px]">
                      {viewItem.currentStock ??
                        0}
                    </p>

                  </div>

                  {/* LOW STOCK */}

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Low Stock Alert
                    </p>

                    <p className="text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {viewItem.lowStockAlert ??
                        0}
                    </p>

                  </div>

                  {/* STOCK STATUS */}

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Stock Status
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                        viewItem.stockStatus ===
                        "OUT_OF_STOCK"
                          ? "bg-[#ffe8eb] text-[#d52d45]"
                          : viewItem.stockStatus ===
                            "LOW_STOCK"
                          ? "bg-[#fff2df] text-[#d67b00]"
                          : "bg-[#e6f9ef] text-[#079657]"
                      }`}
                    >

                      {viewItem.stockStatus ===
                      "OUT_OF_STOCK"
                        ? "Out of Stock"
                        : viewItem.stockStatus ===
                          "LOW_STOCK"
                        ? "Low Stock"
                        : "In Stock"}

                    </span>

                  </div>

                </div>

              </div>

              {/* RECORD INFORMATION */}

              <div className="rounded-[15px] border border-[#dce5ed] bg-white">

                <div className="flex items-center gap-3 border-b border-[#e7edf3] px-4 py-4 sm:gap-4 sm:px-7 sm:py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0eaff] text-lg sm:h-11 sm:w-11 sm:text-xl">
                    📅
                  </div>

                  <div>

                    <h3 className="text-[15px] font-semibold text-[#17385c] sm:text-[17px]">
                      RECORD INFORMATION
                    </h3>

                    <p className="mt-0.5 text-xs text-[#8295aa] sm:mt-1 sm:text-sm">
                      Inventory record information.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-x-12 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:gap-y-7 sm:px-7 sm:py-7">

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Created At
                    </p>

                    <p className="text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {formatDateTime(
                        viewItem.createdAt
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="mb-1 text-xs text-[#8a9db1] sm:mb-2 sm:text-sm">
                      Last Updated
                    </p>

                    <p className="text-[15px] font-medium text-[#183654] sm:text-[16px]">
                      {formatDateTime(
                        viewItem.updatedAt
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ====================================================
          MANAGE INVENTORY MODAL
      ==================================================== */}

      {manageItem && (

        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-6">

          <div className="flex max-h-[94vh] w-full max-w-[860px] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl sm:rounded-[20px]">

            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e4ebf2] bg-white px-5 py-4 sm:px-8 sm:py-6">

              <div>

                <h2 className="text-xl font-bold text-[#172b4d] sm:text-[24px]">
                  Manage Inventory
                </h2>

                <p className="mt-1 text-sm text-[#7388a0] sm:text-[15px]">
                  Receive stock and update cost,
                  selling and stock-alert details.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseManage
                }
                disabled={
                  manageLoading
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-2xl leading-none text-[#6d8299] transition hover:bg-[#e7edf3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <form
              onSubmit={
                handleManageSubmit
              }
              className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-7"
            >

              {/* ITEM INFORMATION */}

              <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-7 sm:gap-4 md:grid-cols-3">

                <div className="rounded-2xl bg-[#f7f9fc] px-5 py-3.5 sm:px-6 sm:py-5">

                  <p className="text-[13px] font-medium text-[#8295aa]">
                    Sport
                  </p>

                  <p className="mt-1 break-words text-[16px] font-semibold text-[#17385c] sm:mt-3 sm:text-[17px]">
                    {manageItem.sportName ||
                      "-"}
                  </p>

                </div>

                <div className="rounded-2xl bg-[#f7f9fc] px-5 py-3.5 sm:px-6 sm:py-5">

                  <p className="text-[13px] font-medium text-[#8295aa]">
                    Sub Item
                  </p>

                  <p className="mt-1 break-words text-[16px] font-semibold text-[#17385c] sm:mt-3 sm:text-[17px]">
                    {manageItem.subItem ||
                      "-"}
                  </p>

                </div>

                <div className="rounded-2xl bg-[#f7f9fc] px-5 py-3.5 sm:px-6 sm:py-5">

                  <p className="text-[13px] font-medium text-[#8295aa]">
                    Brand
                  </p>

                  <p className="mt-1 break-words text-[16px] font-semibold text-[#17385c] sm:mt-3 sm:text-[17px]">
                    {manageItem.brand ||
                      "-"}
                  </p>

                </div>

              </div>

              {/* CURRENT STOCK */}

              <div className="mb-5 sm:mb-7">

                <label className="mb-2 block text-[15px] font-semibold text-[#415d79]">
                  Current Stock
                </label>

                <div className="flex h-12 items-center rounded-[14px] border border-[#d5e0eb] bg-[#f5f7fa] px-4 sm:h-14 sm:px-5">

                  <span className="text-[17px] font-semibold text-[#536b86]">
                    {manageItem.currentStock ??
                      0}
                  </span>

                  <span className="ml-2 text-sm text-[#91a3b6]">
                    units currently available
                  </span>

                </div>

              </div>

              {/* NEW STOCK */}

              <div className="mb-5 sm:mb-7">

                <label
                  htmlFor="manage-received-stock"
                  className="mb-2 block text-[15px] font-semibold text-[#415d79]"
                >
                  New Stock Received{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  ref={
                    receivedQuantityRef
                  }
                  id="manage-received-stock"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={
                    receivedQuantity
                  }
                  placeholder="Enter received quantity"
                  onChange={(event) => {

                    handleNumberInput(
                      setReceivedQuantity,
                      event.target.value
                    );

                    setManageErrors(
                      (previous) => ({
                        ...previous,
                        receivedQuantity:
                          "",
                      })
                    );

                  }}
                  disabled={
                    manageLoading
                  }
                  className={`h-12 w-full rounded-[14px] border bg-white px-4 text-[16px] text-[#263e5a] outline-none transition sm:h-14 sm:px-5 ${
                    manageErrors.receivedQuantity
                      ? "border-red-500 ring-1 ring-red-100"
                      : "border-[#d5e0eb]"
                  } focus:border-[#0787c8] focus:ring-2 focus:ring-[#0787c8]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7fa]`}
                />

                <ErrorText
                  error={
                    manageErrors.receivedQuantity
                  }
                />

                <p className="mt-2 text-xs text-[#8a9db1]">
                  Enter only the additional quantity received.
                </p>

              </div>

              {/* COST PRICE */}

              <div className="mb-5 sm:mb-7">

                <label
                  htmlFor="manage-cost-price"
                  className="mb-2 block text-[15px] font-semibold text-[#415d79]"
                >
                  Cost Price{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#8ea2b7] sm:left-5">
                    ₹
                  </span>

                  <input
                    ref={
                      costPriceRef
                    }
                    id="manage-cost-price"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={
                      costPrice
                    }
                    placeholder="Enter cost price"
                    onChange={(event) => {

                      handleNumberInput(
                        setCostPrice,
                        event.target.value,
                        true
                      );

                      setManageErrors(
                        (previous) => ({
                          ...previous,
                          costPrice:
                            "",
                        })
                      );

                    }}
                    disabled={
                      manageLoading
                    }
                    className={`h-12 w-full rounded-[14px] border bg-white pl-9 pr-4 text-[16px] text-[#263e5a] outline-none transition sm:h-14 sm:pl-10 sm:pr-5 ${
                      manageErrors.costPrice
                        ? "border-red-500 ring-1 ring-red-100"
                        : "border-[#d5e0eb]"
                    } focus:border-[#0787c8] focus:ring-2 focus:ring-[#0787c8]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7fa]`}
                  />

                </div>

                <ErrorText
                  error={
                    manageErrors.costPrice
                  }
                />

                <p className="mt-2 text-xs text-[#8a9db1]">
                  Purchase/cost price per unit.
                </p>

              </div>

              {/* SELLING PRICE */}

              <div className="mb-5 sm:mb-7">

                <label
                  htmlFor="manage-selling-price"
                  className="mb-2 block text-[15px] font-semibold text-[#415d79]"
                >
                  Selling Price{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#8ea2b7] sm:left-5">
                    ₹
                  </span>

                  <input
                    ref={
                      sellingPriceRef
                    }
                    id="manage-selling-price"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={
                      sellingPrice
                    }
                    placeholder="Enter selling price"
                    onChange={(event) => {

                      handleNumberInput(
                        setSellingPrice,
                        event.target.value,
                        true
                      );

                      setManageErrors(
                        (previous) => ({
                          ...previous,
                          sellingPrice:
                            "",
                        })
                      );

                    }}
                    disabled={
                      manageLoading
                    }
                    className={`h-12 w-full rounded-[14px] border bg-white pl-9 pr-4 text-[16px] text-[#263e5a] outline-none transition sm:h-14 sm:pl-10 sm:pr-5 ${
                      manageErrors.sellingPrice
                        ? "border-red-500 ring-1 ring-red-100"
                        : "border-[#d5e0eb]"
                    } focus:border-[#0787c8] focus:ring-2 focus:ring-[#0787c8]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7fa]`}
                  />

                </div>

                <ErrorText
                  error={
                    manageErrors.sellingPrice
                  }
                />

              </div>

              {/* LOW STOCK */}

              <div className="mb-6 sm:mb-8">

                <label
                  htmlFor="manage-low-stock-alert"
                  className="mb-2 block text-[15px] font-semibold text-[#415d79]"
                >
                  Low Stock Alert{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  ref={
                    lowStockAlertRef
                  }
                  id="manage-low-stock-alert"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={
                    lowStockAlert
                  }
                  placeholder="Enter low stock limit"
                  onChange={(event) => {

                    handleNumberInput(
                      setLowStockAlert,
                      event.target.value
                    );

                    setManageErrors(
                      (previous) => ({
                        ...previous,
                        lowStockAlert:
                          "",
                      })
                    );

                  }}
                  disabled={
                    manageLoading
                  }
                  className={`h-12 w-full rounded-[14px] border bg-white px-4 text-[16px] text-[#263e5a] outline-none transition sm:h-14 sm:px-5 ${
                    manageErrors.lowStockAlert
                      ? "border-red-500 ring-1 ring-red-100"
                      : "border-[#d5e0eb]"
                  } focus:border-[#0787c8] focus:ring-2 focus:ring-[#0787c8]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7fa]`}
                />

                <ErrorText
                  error={
                    manageErrors.lowStockAlert
                  }
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#e7edf3] pt-5 sm:flex-row sm:justify-end sm:pt-6">

                <button
                  type="button"
                  onClick={
                    handleCloseManage
                  }
                  disabled={
                    manageLoading
                  }
                  className="h-12 w-full rounded-[12px] border border-[#d4deea] bg-white px-7 text-[15px] font-semibold text-[#536b86] transition hover:bg-[#f7fafc] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    manageLoading
                  }
                  className="h-12 w-full rounded-[12px] bg-[#0787c8] px-7 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#0678b3] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[190px]"
                >

                  {manageLoading
                    ? "Updating..."
                    : "Update Inventory"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ====================================================
          STATUS MODAL
      ==================================================== */}

      {statusConfirmItem && (

        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-5">

          <div className="w-full max-w-[470px] rounded-t-[20px] bg-white p-5 shadow-2xl sm:rounded-[18px] sm:p-7">

            {statusConfirmAction ===
            "BLOCKED" ? (

              <>

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600 sm:mb-5">
                  !
                </div>

                <h2 className="text-xl font-bold text-[#172b4d]">
                  Cannot Deactivate Inventory
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#667d96]">

                  This inventory item currently
                  has{" "}

                  <strong className="text-[#172b4d]">
                    {
                      statusConfirmItem.currentStock
                    }
                  </strong>{" "}

                  units in stock.

                  You cannot make an item
                  inactive while stock is available.

                </p>

                <p className="mt-2 text-sm text-[#667d96]">
                  Please use the available stock first,
                  then try again.
                </p>

                <div className="mt-6 flex sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeStatusModal
                    }
                    className="h-11 w-full rounded-xl bg-[#0787c8] px-7 font-semibold text-white transition hover:bg-[#0678b3] sm:w-auto"
                  >
                    Okay
                  </button>

                </div>

              </>

            ) : (

              <>

                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl sm:mb-5 ${
                    statusConfirmAction ===
                    "ACTIVE"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  ⏻
                </div>

                <h2 className="text-xl font-bold text-[#172b4d]">

                  {statusConfirmAction ===
                  "ACTIVE"
                    ? "Activate Inventory"
                    : "Deactivate Inventory"}

                </h2>

                <p className="mt-3 text-sm leading-6 text-[#667d96]">

                  Are you sure you want to{" "}

                  <strong>
                    {statusConfirmAction ===
                    "ACTIVE"
                      ? "activate"
                      : "deactivate"}
                  </strong>{" "}

                  <strong className="text-[#172b4d]">
                    {
                      statusConfirmItem.subItem
                    }{" "}
                    -{" "}
                    {
                      statusConfirmItem.brand
                    }
                  </strong>
                  ?

                </p>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    disabled={
                      statusActionLoading
                    }
                    onClick={
                      closeStatusModal
                    }
                    className="h-11 w-full rounded-xl border border-[#d4deea] bg-white px-6 font-semibold text-[#536b86] transition hover:bg-[#f7fafc] disabled:opacity-60 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      statusActionLoading
                    }
                    onClick={
                      confirmStatusChange
                    }
                    className={`h-11 w-full rounded-xl px-6 font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
                      statusConfirmAction ===
                      "ACTIVE"
                        ? "bg-[#0787c8] hover:bg-[#0678b3]"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >

                    {statusActionLoading
                      ? "Updating..."
                      : statusConfirmAction ===
                        "ACTIVE"
                      ? "Activate"
                      : "Deactivate"}

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default InventoryManagement;
