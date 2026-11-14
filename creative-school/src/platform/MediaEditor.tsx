import ImageWorkbench from './media-image-editor';
import VideoWorkbench from './media-video-editor';
import './media-workspace.css';
import type{ImageDoc}from'./media-image-editor';
import type{VideoDoc}from'./media-video-editor';
export default function MediaEditor({kind,value,onChange,cacheScope='local'}:{kind:'image'|'video';value:ImageDoc|VideoDoc;onChange:(value:unknown)=>void;cacheScope?:string}){return kind==='image'?<ImageWorkbench value={value as ImageDoc} onChange={onChange} scope={cacheScope}/>:<VideoWorkbench value={value as VideoDoc} onChange={onChange} scope={cacheScope}/>;}
