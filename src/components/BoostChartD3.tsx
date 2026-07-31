import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Activity, Zap, Gauge, Flame, Sparkles } from 'lucide-react';

interface DataPoint {
  time: number;
  balance: number;
}

interface BoostChartD3Props {
  history: DataPoint[];
  isBoosting: boolean;
  boostMultiplier: number;
  onMultiplierChange: (multiplier: number) => void;
  onToggleBoost: () => void;
}

export const BoostChartD3: React.FC<BoostChartD3Props> = ({
  history,
  isBoosting,
  boostMultiplier,
  onMultiplierChange,
  onToggleBoost,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || history.length < 2) return;

    const containerWidth = containerRef.current.clientWidth || 350;
    const height = 180;
    const margin = { top: 15, right: 15, bottom: 25, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', containerWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const xExtent = d3.extent(history, (d: DataPoint) => d.time) as [number, number];
    const yExtent = d3.extent(history, (d: DataPoint) => d.balance) as [number, number];

    const xScale = d3
      .scaleTime()
      .domain(xExtent[0] !== undefined && xExtent[1] !== undefined ? xExtent : [Date.now() - 10000, Date.now()])
      .range([0, width]);

    const yMin = yExtent[0] !== undefined ? yExtent[0] * 0.9999 : 0;
    const yMax = yExtent[1] !== undefined ? yExtent[1] * 1.0001 : 100;
    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax === yMin ? yMin + 1 : yMax])
      .nice()
      .range([innerHeight, 0]);

    // Area generator
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(d.balance))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.balance))
      .curve(d3.curveMonotoneX);

    // Gradient definitions
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'boost-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.45);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Add Area
    g.append('path')
      .datum(history)
      .attr('fill', 'url(#boost-gradient)')
      .attr('d', area);

    // Add Line
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#34d399')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(4)
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(new Date(Number(d))));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `৳${Number(d).toLocaleString(undefined, { maximumFractionDigits: 1 })}`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif');

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).ticks(4).tickSize(-width).tickFormat(() => ''));

  }, [history]);

  const latestBalance = history.length > 0 ? history[history.length - 1].balance : 0;
  const initialBalance = history.length > 0 ? history[0].balance : latestBalance;
  const diff = latestBalance - initialBalance;

  return (
    <div ref={containerRef} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isBoosting ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>BoostPay™ Nano-Compounding Engine</span>
              {isBoosting && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono animate-pulse">{boostMultiplier}x Active</span>}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isBoosting ? `Rate: ${(2.6746 * boostMultiplier).toFixed(4)}e-13% / ns compounding` : 'Paused — select multiplier and hit Boost'}
            </p>
          </div>
        </div>

        {/* Multiplier selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
          {[1, 5, 10, 50].map((m) => (
            <button
              key={m}
              onClick={() => onMultiplierChange(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                boostMultiplier === m
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m}x
            </button>
          ))}
          <button
            onClick={onToggleBoost}
            className={`ml-1 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              isBoosting ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isBoosting ? 'Stop' : 'Launch'}</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Session Profit</div>
          <div className="font-bold text-emerald-400">+{diff >= 0 ? diff.toFixed(2) : '0.00'} ৳</div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Multiplier</div>
          <div className="font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> {boostMultiplier}x Turbo
          </div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Engine Status</div>
          <div className={`font-bold ${isBoosting ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
            {isBoosting ? 'Compounding...' : 'Standby'}
          </div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Current Balance</div>
          <div className="font-mono font-bold text-white truncate">৳{latestBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
        </div>
      </div>
    </div>
  );
};

