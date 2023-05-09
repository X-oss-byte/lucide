import { eventHandler, setResponseHeader, defaultContentType } from 'h3'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import SvgPreview from '../../lib/SvgPreview/index.tsx';
import * as iconNodes from '../../data/iconNodes'
import { camelCase } from 'lodash-es'
import createLucideIcon from 'lucide-react/src/createLucideIcon'
import Backdrop from '../../lib/SvgPreview/Backdrop.tsx';

export default eventHandler((event) => {
  const { params } = event.context

  const [name, svgData] = params.data.split('/');
  const data = svgData.slice(0, -4);

  const src = Buffer.from(data, 'base64').toString('utf8');

  const children = []
  const camelCaseName = camelCase(name)

  if (camelCaseName in iconNodes) {
    const iconNode = iconNodes[camelCaseName]

    const LucideIcon = createLucideIcon(name, iconNode)
    const svg = renderToStaticMarkup(createElement(LucideIcon))
    const backdropString = svg.replace(/<svg[^>]*>|<\/svg>/g, '');

    children.push(createElement(Backdrop, { backdropString, src }))
  }

  const svg = Buffer.from(
    renderToString(createElement(SvgPreview, {src, showGrid: true}, children))
  ).toString('utf8');

  defaultContentType(event, 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public,max-age=31536000')

  return svg
})
