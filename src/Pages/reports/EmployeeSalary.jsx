import React, { useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Chip,
    Divider,
    Alert,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
    Calculate,
    PictureAsPdf,
    History,
    Refresh,
} from "@mui/icons-material";

import { getAllStaff } from "../staff/StaffService";
import { getAllCoaches } from "../coach/CoachService";

import salaryService from "./salaryService";


const EmployeeSalary = () => {

    // ==========================================================
    // EMPLOYEES
    // ==========================================================

    const [employees, setEmployees] = useState([]);

    const [selectedEmployee, setSelectedEmployee] =
        useState("");

    const [employeeType, setEmployeeType] =
        useState("STAFF");


    // ==========================================================
    // MONTH / YEAR
    // ==========================================================

    const [month, setMonth] = useState(
        new Date().getMonth() + 1
    );

    const [year, setYear] = useState(
        new Date().getFullYear()
    );


    // ==========================================================
    // SALARY DATA
    // ==========================================================

    const [salaryData, setSalaryData] =
        useState(null);

    const [history, setHistory] =
        useState(null);


    // ==========================================================
    // LOADING / ERROR
    // ==========================================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================================
    // LOAD STAFF + COACH
    // ==========================================================

    const loadEmployees = async () => {

        try {

            setLoading(true);
            setError("");



            const [staffData, coachData] =
                await Promise.all([
                    getAllStaff("ACTIVE"),
                    getAllCoaches()
                ]);


                       const staffList =
    staffData?.data ??
    staffData ??
    [];

const coachList =
    coachData?.data ??
    coachData ??
    [];



            // ==================================================
            // STAFF
   const staffEmployees =
    (Array.isArray(staffList)
        ? staffList
        : []
    ).map((staff) => ({


                    userId: staff.id,

                    username:
                        staff.username ||
                        `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
                        `Staff ${staff.id}`,

                    employeeType: "STAFF"

                }));


            // ==================================================
            // COACH
            // ==================================================
const coachEmployees = (
    Array.isArray(coachList) ? coachList : []
)
    .filter(
        (coach) =>
            !coach.status || coach.status === "ACTIVE"
    )
    .filter(
        (coach) => coach.userId != null
    )
    .map((coach) => ({
        userId: String(coach.userId),

        username:
            coach.username ||
            `${coach.firstName || ""} ${coach.lastName || ""}`.trim() ||
            `Coach ${coach.id}`,

        employeeType: "COACH"
    }));







            // ==================================================
            // COMBINE STAFF + COACH
            // ==================================================

            setEmployees([
                ...staffEmployees,
                ...coachEmployees
            ]);

        } catch (err) {

            console.error(
                "Employee loading error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load employees."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadEmployees();

    }, []);


    // ==========================================================
    // CALCULATE SALARY
    // ==========================================================

    const handleCalculate = async () => {

        if (!selectedEmployee) {

            setError(
                "Please select an employee."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");
            setHistory(null);


            const data =
                await salaryService.calculateSalary({

                    userId:
                        Number(selectedEmployee),

                    employeeType,

                    month:
                        Number(month),

                    year:
                        Number(year)

                });


            setSalaryData(data);


            // Refresh employee list
            await loadEmployees();

        } catch (err) {

            console.error(
                "Salary calculation error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to calculate salary."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // GET SALARY HISTORY
    // ==========================================================

    const handleHistory = async () => {

        if (!selectedEmployee) {

            setError(
                "Please select an employee."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");


            const data =
                await salaryService.getEmployeeHistory(
                    selectedEmployee
                );


            setHistory(data);

        } catch (err) {

            console.error(
                "Salary history error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load salary history."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // MONTHLY SALARY PDF
    // ==========================================================

    const handleSalaryPdf = async () => {

        if (!selectedEmployee) {

            setError(
                "Please select an employee."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");


            const blob =
                await salaryService.getSalaryPdf(
                    selectedEmployee,
                    month,
                    year
                );


            const url =
                window.URL.createObjectURL(blob);


            window.open(
                url,
                "_blank"
            );


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 1000);

        } catch (err) {

            console.error(
                "Salary PDF error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to generate salary PDF."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // SALARY HISTORY PDF
    // ==========================================================

    const handleHistoryPdf = async () => {

        if (!selectedEmployee) {

            setError(
                "Please select an employee."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");


            const blob =
                await salaryService.getSalaryHistoryPdf(
                    selectedEmployee
                );


            const url =
                window.URL.createObjectURL(blob);


            window.open(
                url,
                "_blank"
            );


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 1000);

        } catch (err) {

            console.error(
                "Salary history PDF error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to generate salary history PDF."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // CURRENCY
    // ==========================================================

    const money = (value) => {

        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    };


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <Box
            sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Employee Salary
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Calculate monthly salary and view salary history
                    </Typography>

                </Box>


                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadEmployees}
                    disabled={loading}
                >
                    Refresh
                </Button>

            </Box>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>

            )}


            {/* =================================================
                SALARY CALCULATION
            ================================================= */}

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow:
                        "0 4px 20px rgba(0,0,0,0.06)",
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Salary Calculation
                    </Typography>


                    <Divider sx={{ mb: 3 }} />


                    <Grid
                        container
                        spacing={2}
                    >

                        {/* =====================================
                            EMPLOYEE
                        ===================================== */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 3
                            }}
                        >

                            <FormControl fullWidth>

                                <InputLabel>
                                    Employee
                                </InputLabel>









<Select
    value={selectedEmployee ?? ""}
    label="Employee"
    onChange={(e) => {
        const id = e.target.value;

        setSelectedEmployee(id);
        setSalaryData(null);
        setHistory(null);
        setError("");
    }}
>
    <MenuItem value="">
        <em>Select Employee</em>
    </MenuItem>

    {employees
        .filter((employee) => employee.employeeType === employeeType)
        .map((employee) => (
            <MenuItem
                key={`${employee.employeeType}-${employee.userId}`}
                value={String(employee.userId)}
            >
                {employee.username} - {employee.employeeType}
            </MenuItem>
        ))}
</Select>












                            </FormControl>

                        </Grid>


                        {/* =====================================
                            EMPLOYEE TYPE
                        ===================================== */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 3
                            }}
                        >

                            <FormControl fullWidth>

                                <InputLabel>
                                    Employee Type
                                </InputLabel>







<Select
    value={employeeType ?? "STAFF"}
    label="Employee Type"
    onChange={(e) => {
        setEmployeeType(e.target.value);
        setSelectedEmployee("");
        setSalaryData(null);
        setHistory(null);
        setError("");
    }}
>
    <MenuItem value="STAFF">Staff</MenuItem>
    <MenuItem value="COACH">Coach</MenuItem>
</Select>





                            </FormControl>

                        </Grid>


                        {/* =====================================
                            MONTH
                        ===================================== */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 3
                            }}
                        >

                            <FormControl fullWidth>

                                <InputLabel>
                                    Month
                                </InputLabel>

                                <Select
                                    value={month}
                                    label="Month"
                                    onChange={(e) =>
                                        setMonth(
                                            e.target.value
                                        )
                                    }
                                >

                                    {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                    ].map(
                                        (
                                            name,
                                            index
                                        ) => (

                                            <MenuItem
                                                key={name}
                                                value={
                                                    index + 1
                                                }
                                            >
                                                {name}
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        </Grid>


                        {/* =====================================
                            YEAR
                        ===================================== */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 3
                            }}
                        >

                            <FormControl fullWidth>

                                <InputLabel>
                                    Year
                                </InputLabel>

                                <Select
                                    value={year}
                                    label="Year"
                                    onChange={(e) =>
                                        setYear(
                                            e.target.value
                                        )
                                    }
                                >

                                    {[2025, 2026, 2027].map(
                                        (item) => (

                                            <MenuItem
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        </Grid>


                        {/* =====================================
                            CALCULATE
                        ===================================== */}

                        <Grid
                            size={{
                                xs: 12
                            }}
                        >

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    loading
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : (
                                            <Calculate />
                                        )
                                }
                                onClick={
                                    handleCalculate
                                }
                                disabled={loading}
                                sx={{
                                    height: 56,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}
                            >
                                Calculate Salary
                            </Button>

                        </Grid>

                    </Grid>

                </CardContent>

            </Card>


            {/* =================================================
                SALARY RESULT
            ================================================= */}

            {salaryData && (

                <>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Salary Summary
                    </Typography>


                    <Grid
                        container
                        spacing={2}
                        sx={{ mb: 3 }}
                    >

                        {[
                            [
                                "Monthly Salary",
                                money(
                                    salaryData.monthlySalary
                                ),
                            ],

                            [
                                "Working Days",
                                salaryData.workingDays,
                            ],

                            [
                                "Late Marks",
                                salaryData.lateMarks,
                            ],

                            [
                                "Leave Days",
                                salaryData.approvedLeaveDays,
                            ],

                            [
                                "Deduction Days",
                                salaryData.totalDeductionDays,
                            ],

                            [
                                "Deduction Amount",
                                money(
                                    salaryData.deductionAmount
                                ),
                            ],

                        ].map(
                            ([title, value]) => (

                                <Grid
                                    key={title}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 2
                                    }}
                                >

                                    <Card
                                        sx={{
                                            height: "100%",
                                            borderRadius: 3,
                                        }}
                                    >

                                        <CardContent>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {title}
                                            </Typography>


                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    mt: 1
                                                }}
                                            >
                                                {value}
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                </Grid>

                            )
                        )}

                    </Grid>


                    {/* =========================================
                        FINAL SALARY
                    ========================================= */}

                    <Card
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            background:
                                "linear-gradient(135deg, #0f172a, #1e293b)",
                            color: "white",
                        }}
                    >

                        <CardContent>


<Stack
    direction={{
        xs: "column",
        md: "row",
    }}
    gap={2}
    sx={{
        justifyContent: "space-between",
        alignItems: {
            xs: "flex-start",
            md: "center",
        },
    }}
>





                                <Box>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            opacity: 0.7
                                        }}
                                    >
                                        NET SALARY PAYABLE
                                    </Typography>


                                    <Typography
                                        variant="h3"
                                        fontWeight={800}
                                        sx={{ mt: 1 }}
                                    >
                                        {money(
                                            salaryData.finalSalary
                                        )}
                                    </Typography>

                                </Box>


                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    gap={1}
                                >

                                    <Button
                                        variant="contained"
                                        startIcon={
                                            <PictureAsPdf />
                                        }
                                        onClick={
                                            handleSalaryPdf
                                        }
                                        sx={{
                                            backgroundColor:
                                                "white",

                                            color:
                                                "#0f172a",

                                            "&:hover": {
                                                backgroundColor:
                                                    "#f1f5f9",
                                            },
                                        }}
                                    >
                                        View Salary PDF
                                    </Button>


                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <History />
                                        }
                                        onClick={
                                            handleHistory
                                        }
                                        sx={{
                                            color: "white",

                                            borderColor:
                                                "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        Salary History
                                    </Button>

                                </Stack>

                            </Stack>

                        </CardContent>

                    </Card>

                </>

            )}


            {/* =================================================
                SALARY HISTORY
            ================================================= */}

            {history && (

                <Card
                    sx={{
                        borderRadius: 3,
                        mb: 3,
                    }}
                >

                    <CardContent>

                        <Stack
    direction={{
        xs: "column",
        sm: "row",
    }}
    gap={2}
    sx={{
        mb: 2,
        justifyContent: "space-between",
        alignItems: {
            xs: "flex-start",
            sm: "center",
        },
    }}
>


                            <Box>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Salary History
                                </Typography>


                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {history.username}

                                    {" • "}

                                    {history.employeeType}
                                </Typography>

                            </Box>


                            <Button
                                variant="outlined"
                                startIcon={
                                    <PictureAsPdf />
                                }
                                onClick={
                                    handleHistoryPdf
                                }
                            >
                                History PDF
                            </Button>

                        </Stack>


                        <TableContainer
                            component={Paper}
                            variant="outlined"
                        >

                            <Table>

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            Month
                                        </TableCell>

                                        <TableCell>
                                            Monthly Salary
                                        </TableCell>

                                        <TableCell>
                                            Late Marks
                                        </TableCell>

                                        <TableCell>
                                            Leave Days
                                        </TableCell>

                                        <TableCell>
                                            Deduction Days
                                        </TableCell>

                                        <TableCell>
                                            Deduction
                                        </TableCell>

                                        <TableCell>
                                            Final Salary
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {history.salaryHistory?.map(
                                        (record) => (

                                            <TableRow
                                                key={
                                                    record.id
                                                }
                                            >

                                                <TableCell>

                                                    {String(
                                                        record.month
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}

                                                    /

                                                    {record.year}

                                                </TableCell>


                                                <TableCell>

                                                    {money(
                                                        record.monthlySalary
                                                    )}

                                                </TableCell>


                                                <TableCell>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            record.lateMarks
                                                        }
                                                    />

                                                </TableCell>


                                                <TableCell>

                                                    {
                                                        record.approvedLeaveDays
                                                    }

                                                </TableCell>


                                                <TableCell>

                                                    {
                                                        record.totalDeductionDays
                                                    }

                                                </TableCell>


                                                <TableCell>

                                                    {money(
                                                        record.deductionAmount
                                                    )}

                                                </TableCell>


                                                <TableCell>

                                                    <Typography
                                                        fontWeight={700}
                                                    >
                                                        {money(
                                                            record.finalSalary
                                                        )}
                                                    </Typography>

                                                </TableCell>

                                            </TableRow>

                                        )
                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    </CardContent>

                </Card>

            )}

        </Box>

    );

};


export default EmployeeSalary;