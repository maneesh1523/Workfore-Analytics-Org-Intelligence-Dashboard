import * as d3 from "d3";
import { useEffect, useRef } from "react";

const DEPT_COLORS = {
  Engineering: "#3b82f6",
  Sales:       "#10b981",
  Operations:  "#f59e0b",
  HR:          "#8b5cf6",
  Finance:     "#ef4444",
  Product:     "#06b6d4",
  default:     "#6b7280",
};

const countLeaves = (node) => {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
};

const CARD_W  = 160;
const CARD_H  = 52;
const ROW_GAP = 72;   // vertical space per leaf
const COL_GAP = 220;  // horizontal space per depth level

export default function OrgChartD3({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const root      = d3.hierarchy(data);
    const leafCount = countLeaves(data);
    const maxDepth  = root.height;

    const margin = { top: 40, right: 200, bottom: 40, left: 40 };
    const height = Math.max(600, leafCount * ROW_GAP);
    const width  = (maxDepth + 1) * COL_GAP;

    const tree = d3.tree().size([height, width]);
    tree(root);

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    svgEl
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom);

    const g = svgEl.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Links ──
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
      );

    // ── Node groups ──
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Card shadow filter
    const defs = svgEl.append("defs");
    const filter = defs.append("filter")
      .attr("id", "card-shadow")
      .attr("x", "-20%").attr("y", "-20%")
      .attr("width", "140%").attr("height", "140%");
    filter.append("feDropShadow")
      .attr("dx", 0).attr("dy", 2)
      .attr("stdDeviation", 3)
      .attr("flood-color", "rgba(0,0,0,0.08)");

    // Card background
    node.append("rect")
      .attr("x",      -CARD_W / 2)
      .attr("y",      -CARD_H / 2)
      .attr("width",   CARD_W)
      .attr("height",  CARD_H)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill",   "#ffffff")
      .attr("stroke", (d) => DEPT_COLORS[d.data.department] || DEPT_COLORS.default)
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#card-shadow)");

    // Left color bar
    node.append("rect")
      .attr("x",      -CARD_W / 2)
      .attr("y",      -CARD_H / 2)
      .attr("width",   4)
      .attr("height",  CARD_H)
      .attr("rx", 2)
      .attr("fill", (d) => DEPT_COLORS[d.data.department] || DEPT_COLORS.default);

    // Avatar circle
    node.append("circle")
      .attr("cx", -CARD_W / 2 + 22)
      .attr("cy", 0)
      .attr("r",  16)
      .attr("fill", (d) => DEPT_COLORS[d.data.department] || DEPT_COLORS.default)
      .attr("opacity", 0.15);

    // Avatar initial
    node.append("text")
      .attr("x",  -CARD_W / 2 + 22)
      .attr("y",  5)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("fill", (d) => DEPT_COLORS[d.data.department] || DEPT_COLORS.default)
      .text((d) => (d.data.name || "?").charAt(0).toUpperCase());

    // Name
    node.append("text")
      .attr("x",  -CARD_W / 2 + 44)
      .attr("y",  -6)
      .style("font-size",   "11px")
      .style("font-weight", "600")
      .style("fill",        "#1e293b")
      .text((d) => {
        const name = d.data.name || "";
        return name.length > 16 ? name.slice(0, 15) + "…" : name;
      });

    // Job title
    node.append("text")
      .attr("x",  -CARD_W / 2 + 44)
      .attr("y",  10)
      .style("font-size", "9px")
      .style("fill",      "#64748b")
      .text((d) => {
        const title = d.data.title || d.data.job_title || "";
        return title.length > 20 ? title.slice(0, 19) + "…" : title;
      });

    // Department badge
    node.filter((d) => d.data.department)
      .append("text")
      .attr("x",  CARD_W / 2 - 6)
      .attr("y",  CARD_H / 2 - 6)
      .attr("text-anchor", "end")
      .style("font-size", "8px")
      .style("fill", (d) => DEPT_COLORS[d.data.department] || DEPT_COLORS.default)
      .style("font-weight", "500")
      .text((d) => d.data.department);

    // Tooltip
    node.append("title")
      .text((d) => [d.data.name, d.data.title || d.data.job_title, d.data.department]
        .filter(Boolean).join("\n"));

  }, [data]);

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "700px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}