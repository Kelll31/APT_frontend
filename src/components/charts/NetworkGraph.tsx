import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface NetworkNode {
    id: string;
    name: string;
    type: 'router' | 'switch' | 'device' | 'server';
    ip?: string;
    status: 'online' | 'offline' | 'warning';
}

interface NetworkLink {
    source: string;
    target: string;
    strength: number;
}

interface NetworkGraphProps {
    nodes: NetworkNode[];
    links: NetworkLink[];
    width?: number;
    height?: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
    nodes,
    links,
    width = 800,
    height = 600,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const simulation = d3.forceSimulation(nodes as any)
            .force('link', d3.forceLink(links).id((d: any) => d.id))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#6b7280')
            .attr('stroke-width', (d) => Math.sqrt(d.strength));

        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 8)
            .attr('fill', (d) => {
                switch (d.status) {
                    case 'online': return '#10b981';
                    case 'offline': return '#ef4444';
                    case 'warning': return '#f59e0b';
                    default: return '#6b7280';
                }
            })
            .call(d3.drag<any, any>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        const label = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .text((d) => d.name)
            .attr('font-size', 12)
            .attr('fill', '#e5e7eb')
            .attr('dx', 12)
            .attr('dy', 4);

        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);

            label
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

    }, [nodes, links, width, height]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border border-gray-700 rounded bg-gray-900"
        />
    );
};

export default NetworkGraph;
