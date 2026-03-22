import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Handles all 3 response shapes from your Lambdas:
// Shape 1: API Gateway — body is a JSON string
// Shape 2: API Gateway — body already parsed by axios
// Shape 3: Lambda URL / direct invoke — raw object
const parse = (res) => {
  if (!res || !res.data) return null;

  try {
    const d = res.data;

    if (typeof d.body === "string") {
      return JSON.parse(d.body);
    }

    if (d.body && typeof d.body === "object") {
      return d.body;
    }

    return d;
  } catch (e) {
    console.error("Parse error:", e, res);
    return null;
  }
};

// DynamoDB stores values as Decimal — they come back as strings or numbers.
// Always coerce to Number so chart datasets never receive "5" instead of 5.
const normaliseMetricData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((d) => ({ ...d, value: Number(d.value) }));
};

export const getMetricByType = async (type) => {
  try {
    const res = await axios.get(`${BASE}/metrics?type=${type}`, {
      headers: getHeaders(),
    });
    const parsed = parse(res);
    if (!parsed) console.warn(`getMetricByType(${type}): parse returned null`, res.data);
    return normaliseMetricData(parsed?.data);
  } catch (e) {
    console.error(`getMetricByType(${type}) failed:`, e.response?.data || e.message);
    return [];
  }
};

export const getAttrition = async () => {
  try {
    const res = await axios.get(`${BASE}/attrition`, {
      headers: getHeaders(),
    });
    const parsed = parse(res);
    if (!parsed) console.warn("getAttrition: parse returned null", res.data);
    return parsed?.employees || [];
  } catch (e) {
    console.error("getAttrition failed:", e.response?.data || e.message);
    return [];
  }
};

export const getOrg = async () => {
  try {
    const res = await axios.get(`${BASE}/org-chart`, {
      headers: getHeaders(),
    });
    return parse(res);
  } catch (e) {
    console.error("getOrg failed:", e.response?.data || e.message);
    return null;
  }
};

export const getHealth = async () => {
  try {
    const res = await axios.get(`${BASE}/health`, {
      headers: getHeaders(),
    });
    return parse(res);
  } catch (e) {
    console.error("getHealth failed:", e.response?.data || e.message);
    return null;
  }
};