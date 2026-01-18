import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function ResultPage(props){
  // props: embedded (bool), data (object), onClose (fn), onRetry (fn)
  const navigate = useNavigate();
  const pieChartRef = useRef(null);

  const stateFromLocation = useLocation()?.state;
  const data = props?.embedded ? props?.data : stateFromLocation;

  if(!data) {
    return <div style={{minHeight:200, display:'flex', alignItems:'center', justifyContent:'center'}}>No result data.</div>
  }

  const { moduleTitle, total, score, moduleId } = data;
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (pieChartRef.current) {
      const correctSegment = Math.max(percentage, 5);
      pieChartRef.current.innerHTML = '';
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("class", "w-full h-full");
      const radius = 50;
      const centerX = 50;
      const centerY = 50;
      const incorrectPath = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      incorrectPath.setAttribute("cx", centerX);
      incorrectPath.setAttribute("cy", centerY);
      incorrectPath.setAttribute("r", radius);
      incorrectPath.setAttribute("fill", "#EDF2F7");
      svg.appendChild(incorrectPath);
      if (percentage > 0) {
        const correctPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const angle = (percentage / 100) * 360;
        const startX = centerX;
        const startY = centerY - radius;
        const endAngle = ((90 - angle) * Math.PI) / 180;
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY - radius * Math.sin(endAngle);
        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          "Z"
        ].join(" ");
        correctPath.setAttribute("d", pathData);
        correctPath.setAttribute("fill", "#3B82F6");
        svg.appendChild(correctPath);
      }
      pieChartRef.current.appendChild(svg);
    }
  }, [percentage]);

  

  const handleRetry = () => {
    if (props?.embedded && typeof props.onRetry === 'function') return props.onRetry(moduleId);
    navigate(-1);
  }

  return (
    <div style={{minHeight:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{background:'white', borderRadius:16, boxShadow:'0 10px 20px rgba(16,24,40,0.08)', padding:28, textAlign:'center', maxWidth:420, width:'100%'}}>
        <h3 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Quiz Completed</h3>
        <div style={{color:'#6b7280', marginBottom:12}}>{moduleTitle}</div>

        <div style={{marginBottom:18, position:'relative'}}>
          <div ref={pieChartRef} style={{width:192, height:192, margin:'0 auto'}}></div>
          <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center'}}>
            <div style={{fontSize:32, fontWeight:800, color:'#2563eb'}}>{score}</div>
            <div style={{color:'#6b7280'}}>out of {total}</div>
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:20, fontWeight:700, color:'#2563eb'}}>{percentage}%</div>
          <div style={{color:'#6b7280'}}>Correct Answers</div>
        </div>

        <div style={{marginTop:16, display:'flex', justifyContent:'center', gap:12}}>
          
          <button onClick={handleRetry} style={{padding:'8px 14px', background:'#2563eb', color:'white', borderRadius:8}}>Retry Quiz</button>
        </div>
      </div>
    </div>
  )
}
