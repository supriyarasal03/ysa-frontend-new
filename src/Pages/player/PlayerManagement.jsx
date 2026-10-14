import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Eye,
  Edit2,
    Trash2,
  Download,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import PlayerService from "./PlayerService";

const PlayerManagement = () => {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // =========================================================
  // PLAYER PHOTO
  // =========================================================

  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(null);


  const [deletingPlayerId, setDeletingPlayerId] = useState(null);

  // =========================================================
  // DOCUMENT LOADING
  // =========================================================

  const [documentLoading, setDocumentLoading] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");


  // =========================================================
  // FETCH PLAYERS + SPORTS
  // =========================================================

  const fetchPlayers = async () => {
    try {
      setLoading(true);

      const [playersResponse, sportsResponse] =
        await Promise.all([
          PlayerService.getAll(),
          PlayerService.getSports(),
        ]);

      const playersData =
        playersResponse?.data?.data ??
        playersResponse?.data ??
        [];

      const sportsData =
        sportsResponse?.data?.data ??
        sportsResponse?.data ??
        [];

      setPlayers(
        Array.isArray(playersData) ? playersData : []
      );

      setSports(
        Array.isArray(sportsData) ? sportsData : []
      );

    } catch (err) {
      console.error(
        "Failed to load players/sports:",
        err
      );

      setPlayers([]);
      setSports([]);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPlayers();
  }, []);


  // =========================================================
  // LOAD PLAYER PHOTO
  // =========================================================

  useEffect(() => {
    let objectUrl = null;

    const loadPhoto = async () => {
      if (
        !selectedPlayer?.id ||
        !selectedPlayer?.photoUrl
      ) {
        setPlayerPhotoUrl(null);
        return;
      }

      try {
        const response =
          await PlayerService.getPlayerDocument(
            selectedPlayer.id,
            "photo"
          );

        objectUrl = URL.createObjectURL(
          response.data
        );

        setPlayerPhotoUrl(objectUrl);

      } catch (error) {
        console.error(
          "Failed to load player photo:",
          error
        );

        setPlayerPhotoUrl(null);
      }
    };

    loadPhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedPlayer]);


  // =========================================================
  // VIEW PLAYER
  // =========================================================

  const handleViewPlayer = async (id) => {
    try {
      setViewLoading(true);

      const res = await PlayerService.getById(id);

      const playerData =
        res?.data?.data ??
        res?.data ??
        null;

      setSelectedPlayer(playerData);

    } catch (error) {
      console.error(
        "Failed to fetch player:",
        error
      );

    } finally {
      setViewLoading(false);
    }
  };


  // =========================================================
  // CLOSE PLAYER VIEW
  // =========================================================

  const closePlayerView = () => {
    setSelectedPlayer(null);
    setPlayerPhotoUrl(null);
  };


  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleViewDocument = async (
    documentType
  ) => {
    if (!selectedPlayer?.id) {
      return;
    }

    const loadingKey = `view-${documentType}`;

    try {
      setDocumentLoading((prev) => ({
        ...prev,
        [loadingKey]: true,
      }));

      const response =
        await PlayerService.getPlayerDocument(
          selectedPlayer.id,
          documentType
        );

      const blob = response.data;

      const objectUrl =
        URL.createObjectURL(blob);

      window.open(
        objectUrl,
        "_blank",
        "noopener,noreferrer"
      );

      // Keep URL alive for the opened document
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60000);

    } catch (error) {
      console.error(
        `Failed to view ${documentType}:`,
        error
      );

      alert("Unable to open document.");

    } finally {
      setDocumentLoading((prev) => ({
        ...prev,
        [loadingKey]: false,
      }));
    }
  };


  // =========================================================
  // DOWNLOAD DOCUMENT
  // =========================================================

  const handleDownloadDocument = async (
    documentType,
    label
  ) => {
    if (!selectedPlayer?.id) {
      return;
    }

    const loadingKey =
      `download-${documentType}`;

    try {
      setDocumentLoading((prev) => ({
        ...prev,
        [loadingKey]: true,
      }));

      const response =
        await PlayerService.getPlayerDocument(
          selectedPlayer.id,
          documentType
        );

      const blob = response.data;

      const contentDisposition =
        response.headers?.["content-disposition"];

      let extension = "";

      if (contentDisposition) {
        const fileNameMatch =
          contentDisposition.match(
            /filename="?([^"]+)"?/i
          );

        if (fileNameMatch?.[1]) {
          const originalFileName =
            fileNameMatch[1];

          const extensionMatch =
            originalFileName.match(
              /(\.[a-zA-Z0-9]+)$/
            );

          if (extensionMatch?.[1]) {
            extension =
              extensionMatch[1];
          }
        }
      }

      if (!extension) {
        const mimeType =
          blob.type || "";

        if (mimeType.includes("pdf")) {
          extension = ".pdf";
        } else if (
          mimeType.includes("jpeg") ||
          mimeType.includes("jpg")
        ) {
          extension = ".jpg";
        } else if (
          mimeType.includes("png")
        ) {
          extension = ".png";
        } else {
          extension = "";
        }
      }

      const fileName =
        `${label.replace(/\s+/g, "_")}_${selectedPlayer.id}${extension}`;

      const objectUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);

    } catch (error) {
      console.error(
        `Failed to download ${documentType}:`,
        error
      );

      alert("Unable to download document.");

    } finally {
      setDocumentLoading((prev) => ({
        ...prev,
        [loadingKey]: false,
      }));
    }
  };


  // =========================================================
  // FILTER PLAYERS
  // =========================================================

  const filtered = [...players]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .filter((p) => {
    const fullName =
      `${p.firstName || ""} ${p.lastName || ""}`
        .toLowerCase();

    const searchText =
      search.toLowerCase();

    const matchesSearch =
      fullName.includes(searchText) ||
      (p.playerEmail || "")
        .toLowerCase()
        .includes(searchText) ||
      (p.playerMobileNo || "")
        .includes(search) ||
      (p.parentMobileNo || "")
        .includes(search);

    const playerStatus =
      String(p.status || "")
        .trim()
        .toUpperCase();

    const matchesStatus =
      statusFilter === "All Status" ||
      playerStatus ===
        statusFilter.toUpperCase();

    return (
      matchesSearch &&
      matchesStatus
    );
  });


  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(
    filtered.length / playersPerPage
  );

  const startIndex =
    (currentPage - 1) *
    playersPerPage;

  const endIndex =
    startIndex + playersPerPage;

  const paginatedPlayers =
    filtered.slice(
      startIndex,
      endIndex
    );


  // =========================================================
  // PLAYER COUNTS
  // =========================================================

  const total = players.length;

  const active = players.filter(
    (p) =>
      String(p.status || "")
        .toUpperCase() === "ACTIVE"
  ).length;

  const inactive = players.filter(
    (p) =>
      String(p.status || "")
        .toUpperCase() === "INACTIVE"
  ).length;


  // =========================================================
  // SPORT NAME
  // =========================================================

  const getSportName = (sportId) => {
    if (!sportId) {
      return "—";
    }

    const sport = sports.find(
      (item) =>
        String(item.id) ===
        String(sportId)
    );

    return (
      sport?.sportsName ||
      sport?.name ||
      "—"
    );
  };



  




  
const handlePermanentDelete = async (player) => {
  const playerName =
    `${player.firstName || ""} ${player.lastName || ""}`.trim();

  const confirmed = window.confirm(
    `Permanently delete ${playerName || `Player #${player.id}`}?\n\n` +
    "This action cannot be undone. The player's related records may also be deleted."
  );

  if (!confirmed) return;

  try {
    setDeletingPlayerId(player.id);

    await PlayerService.deletePermanently(player.id);

    // Close the details modal if this player is currently open.
    if (selectedPlayer?.id === player.id) {
      closePlayerView();
    }

    // Reload the player list and counts.
    await fetchPlayers();

    // Prevent pagination from remaining on an empty page.
    setCurrentPage(1);

    window.alert("Player permanently deleted successfully.");
  } catch (error) {
    console.error("Failed to permanently delete player:", error);

    window.alert(
      error?.response?.data?.message ||
      "Unable to permanently delete the player. Please try again."
    );
  } finally {
    setDeletingPlayerId(null);
  }
};









  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = async (
    player,
    newStatus
  ) => {
    try {
      if (newStatus === "ACTIVE") {
        await PlayerService.activate(
          player.id
        );
      } else {
        await PlayerService.deactivate(
          player.id
        );
      }

      await fetchPlayers();

    } catch (error) {
      console.error(
        "Failed to update player status:",
        error
      );
    }
  };


  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Player Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage all players of Yashree Sports Academy
          </p>
        </div>

       <Link
  to="/receptionist/player-form"
  className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium no-underline rounded-lg hover:bg-blue-700"
>
  <Plus className="w-4 h-4" />
  <span>Add New Player</span>
</Link>

      </div>


      {/* =====================================================
          STATS CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total Players
            </p>

            <p className="text-2xl font-bold text-gray-900">
              {total}
            </p>
          </div>

        </div>


        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Active Players
            </p>

            <p className="text-2xl font-bold text-gray-900">
              {active}
            </p>
          </div>

        </div>


        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
            <UserX className="w-6 h-6 text-rose-600" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Inactive Players
            </p>

            <p className="text-2xl font-bold text-gray-900">
              {inactive}
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Search + Filters */}

        <div className="p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b border-gray-100">

          <div className="relative w-full lg:w-80">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email or mobile..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          <div className="flex flex-wrap gap-3">

            <div className="flex items-center gap-2">

              <span className="text-sm text-gray-500">
                Status
              </span>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

            </div>

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">

                <th className="px-5 py-3.5 font-medium">
                  Avatar
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Player
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Contact
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Sport
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Gender
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Admission
                </th>

                <th className="px-5 py-3.5 font-medium">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading players...
                  </td>
                </tr>

              ) : filtered.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No players found
                  </td>
                </tr>

              ) : (

                paginatedPlayers.map(
                  (player) => (

                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 transition-colors"
                    >

                      <td className="px-5 py-4">

                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">

                          {(player.firstName?.[0] || "P") +
                            (player.lastName?.[0] || "")}

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <p className="font-medium text-gray-900">
                          {player.firstName}{" "}
                          {player.lastName}
                        </p>

                        <p className="text-xs text-gray-500">
                          #{player.id}
                        </p>

                      </td>


                      <td className="px-5 py-4">

                        <p className="text-gray-700">
                          {player.playerEmail ||
                            player.parentEmail ||
                            "—"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {player.playerMobileNo ||
                            player.parentMobileNo ||
                            "—"}
                        </p>

                      </td>


                      <td className="px-5 py-4">

                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {getSportName(
                            player.sportId
                          )}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-gray-700">
                        {player.gender || "—"}
                      </td>


                      <td className="px-5 py-4 text-gray-600">

                        {player.admissionDate
                          ? new Date(
                              player.admissionDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}

                      </td>


                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewPlayer(
                                player.id
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/receptionist/player-form/${player.id}`
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>


                          {/* STATUS */}

                          <select
                            value={
                              player.status ||
                              "ACTIVE"
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                player,
                                e.target.value
                              )
                            }
                            className={`text-xs font-medium rounded-lg px-2 py-1.5 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              String(
                                player.status
                              ).toUpperCase() ===
                              "ACTIVE"
                                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                                : "text-red-700 border-red-200 bg-red-50"
                            }`}
                          >

                            <option value="ACTIVE">
                              Active
                            </option>

                            <option value="INACTIVE">
                              Inactive
                            </option>

                          </select>






<button
  type="button"
  onClick={() => handlePermanentDelete(player)}
  disabled={deletingPlayerId === player.id}
  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
  title="Delete Permanently"
  aria-label={`Permanently delete ${player.firstName || "player"}`}
>
  {deletingPlayerId === player.id ? (
    <span className="text-xs">Deleting...</span>
  ) : (
    <Trash2 className="w-4 h-4" />
  )}
</button>







                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>


          {/* =================================================
              PAGINATION
          ================================================= */}

          {filtered.length > 0 && (

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">

              <p className="text-sm text-gray-500">

                Showing{" "}

                <span className="font-medium text-gray-700">
                  {startIndex + 1}
                </span>

                {" "}to{" "}

                <span className="font-medium text-gray-700">
                  {Math.min(
                    endIndex,
                    filtered.length
                  )}
                </span>

                {" "}of{" "}

                <span className="font-medium text-gray-700">
                  {filtered.length}
                </span>

                {" "}players

              </p>


              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev - 1
                    )
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>


                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  {currentPage} /{" "}
                  {totalPages}
                </span>


                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev + 1
                    )
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          )}

        </div>


        {/* =====================================================
            PLAYER VIEW MODAL
        ===================================================== */}

        {selectedPlayer && (

          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-xl flex flex-col">


              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="flex items-center justify-between px-8 py-6 bg-slate-900 shrink-0">

                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Player Details
                  </h2>

                  <p className="text-sm text-slate-300 mt-1">
                    View player information
                  </p>
                </div>


                <button
                  type="button"
                  onClick={closePlayerView}
                  className="text-slate-300 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>

              </div>


              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="overflow-y-auto">

                {viewLoading ? (

                  <div className="p-10 text-center text-gray-500">
                    Loading player details...
                  </div>

                ) : (

                  <div className="p-8">


                    {/* =================================================
                        PLAYER HEADER
                    ================================================= */}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">

                      {/* PHOTO */}

                      <div className="w-32 h-32 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">

                        {playerPhotoUrl ? (

                          <img
                            src={playerPhotoUrl}
                            alt="Player"
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <span className="text-3xl font-semibold text-blue-600">
                            {(selectedPlayer.firstName?.[0] || "P") +
                              (selectedPlayer.lastName?.[0] || "")}
                          </span>

                        )}

                      </div>


                      {/* PLAYER NAME */}

                      <div className="min-w-0">

                        <h3 className="text-3xl font-bold text-slate-900">
                          {selectedPlayer.firstName}{" "}
                          {selectedPlayer.lastName}
                        </h3>


                        <p className="text-base text-slate-500 mt-2">
                          {selectedPlayer.username ||
                            "Player profile"}
                        </p>


                        <span
                          className={`inline-flex mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            String(
                              selectedPlayer.status
                            ).toUpperCase() ===
                            "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {selectedPlayer.status ||
                            "—"}
                        </span>

                      </div>

                    </div>


                    {/* =================================================
                        PERSONAL DETAILS
                    ================================================= */}

                    <div className="space-y-6">


                      <ViewSection title="Personal Details">

                        <ViewField
                          label="First Name"
                          value={
                            selectedPlayer.firstName
                          }
                        />

                        <ViewField
                          label="Last Name"
                          value={
                            selectedPlayer.lastName
                          }
                        />

                        <ViewField
                          label="Gender"
                          value={
                            selectedPlayer.gender
                          }
                        />

                        <ViewField
                          label="Blood Group"
                          value={
                            selectedPlayer.bloodGroup
                          }
                        />

                        <ViewField
                          label="Date of Birth"
                          value={
                            selectedPlayer.dateOfBirth
                          }
                        />

                        <ViewField
                          label="Admission Date"
                          value={
                            selectedPlayer.admissionDate
                          }
                        />

                        <ViewField
                          label="Age"
                          value={
                            selectedPlayer.age
                          }
                        />

                      </ViewSection>


                      {/* =================================================
                          CONTACT DETAILS
                      ================================================= */}

                      <ViewSection title="Contact Details">

                        <ViewField
                          label="Player Mobile"
                          value={
                            selectedPlayer.playerMobileNo
                          }
                        />

                        <ViewField
                          label="Player Email"
                          value={
                            selectedPlayer.playerEmail
                          }
                        />

                        <ViewField
                          label="Parent Name"
                          value={
                            selectedPlayer.parentName
                          }
                        />

                        <ViewField
                          label="Parent Mobile"
                          value={
                            selectedPlayer.parentMobileNo
                          }
                        />

                        <ViewField
                          label="Parent Email"
                          value={
                            selectedPlayer.parentEmail
                          }
                        />

                        <ViewField
                          label="Username"
                          value={
                            selectedPlayer.username
                          }
                        />

                        <ViewField
                          label="Account Email"
                          value={
                            selectedPlayer.email
                          }
                        />

                      </ViewSection>


                      {/* =================================================
                          ACADEMY DETAILS
                      ================================================= */}

                      <ViewSection title="Academy Details">

                        <ViewField
                          label="Sport"
                          value={
                            selectedPlayer.sportName ||
                            selectedPlayer.sport?.sportsName ||
                            selectedPlayer.sport?.name
                          }
                        />

                        <ViewField
                          label="Status"
                          value={
                            selectedPlayer.status
                          }
                        />

                      </ViewSection>


                      {/* =================================================
                          MEDICAL
                      ================================================= */}

                      <ViewSection title="Medical">

                        <ViewField
                          label="Has Injury"
                          value={
                            selectedPlayer.hasInjury ===
                            true
                              ? "Yes"
                              : selectedPlayer.hasInjury ===
                                false
                              ? "No"
                              : null
                          }
                        />

                        <ViewField
                          label="Injury Details"
                          value={
                            selectedPlayer.injuryDetails
                          }
                        />

                      </ViewSection>


                      {/* =================================================
                          DOCUMENTS
                      ================================================= */}

                      <div className="rounded-2xl border border-slate-200 p-6">

                        <h4 className="text-lg font-semibold text-slate-900 mb-5">
                          Documents
                        </h4>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {[
                            [
                              "Aadhaar Front",
                              "aadhaar-front",
                              selectedPlayer.aadhaarFrontUrl,
                            ],
                            [
                              "Aadhaar Back",
                              "aadhaar-back",
                              selectedPlayer.aadhaarBackUrl,
                            ],
                            [
                              "PAN Card",
                              "pan",
                              selectedPlayer.panCardUrl,
                            ],
                            [
                              "Certificate",
                              "certificate",
                              selectedPlayer.certificateUrl,
                            ],
                          ].map(
                            ([
                              label,
                              documentType,
                              url,
                            ]) => {

                              const viewKey =
                                `view-${documentType}`;

                              const downloadKey =
                                `download-${documentType}`;

                              const isViewLoading =
                                documentLoading[
                                  viewKey
                                ];

                              const isDownloadLoading =
                                documentLoading[
                                  downloadKey
                                ];

                              return (

                                <div
                                  key={label}
                                  className="rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between gap-4"
                                >

                                  <span className="text-sm font-medium text-slate-700">
                                    {label}
                                  </span>


                                  {url ? (

                                    <div className="flex items-center gap-5">

                                      {/* VIEW */}

                                      <button
                                        type="button"
                                        disabled={
                                          isViewLoading ||
                                          isDownloadLoading
                                        }
                                        onClick={() =>
                                          handleViewDocument(
                                            documentType
                                          )
                                        }
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isViewLoading
                                          ? "Opening..."
                                          : "View"}
                                      </button>


                                      {/* DOWNLOAD */}

                                      <button
                                        type="button"
                                        disabled={
                                          isViewLoading ||
                                          isDownloadLoading
                                        }
                                        onClick={() =>
                                          handleDownloadDocument(
                                            documentType,
                                            label
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >

                                        <Download className="w-4 h-4" />

                                        {isDownloadLoading
                                          ? "Downloading..."
                                          : "Download"}

                                      </button>

                                    </div>

                                  ) : (

                                    <span className="text-xs text-slate-400">
                                      Not uploaded
                                    </span>

                                  )}

                                </div>

                              );
                            }
                          )}

                        </div>

                      </div>


                      {/* =================================================
                          ADDRESS
                      ================================================= */}

                      <ViewSection title="Address">

                        <ViewField
                          label="Address"
                          value={
                            selectedPlayer.address
                          }
                        />

                      </ViewSection>


                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="px-8 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">

                <button
                  type="button"
                  onClick={closePlayerView}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};


// =============================================================
// VIEW SECTION
// =============================================================

const ViewSection = ({
  title,
  children,
}) => {

  return (
    <div className="rounded-2xl border border-slate-200 p-6">

      <h4 className="text-lg font-semibold text-slate-900 mb-6">
        {title}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
        {children}
      </div>

    </div>
  );
};


// =============================================================
// VIEW FIELD
// =============================================================

const ViewField = ({
  label,
  value,
}) => {

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "—"
  ) {
    return null;
  }

  return (
    <div>

      <p className="text-sm text-slate-500 mb-1">
        {label}
      </p>

      <p className="text-base font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
};


export default PlayerManagement;