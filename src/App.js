import { useEffect, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Slider, Stack } from '@mui/material';

const firebaseConfig = {
  apiKey: "AIzaSyD_bUvgzrtGDKakaXi0AswV1v-o3T2lnHg",
  authDomain: "go-gamers-f5d9b.firebaseapp.com",
  projectId: "go-gamers-f5d9b",
  storageBucket: "go-gamers-f5d9b.appspot.com",
  messagingSenderId: "628130654826",
  appId: "1:628130654826:web:11a5fa3293e0d1d985f813"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let trail = [];
const logoMap = {
  golinks: './logo.png',
  gosearch: './search.png',
  goprofiles: './profile.png'
}

const getRandomWindowPos = (min, max) => {
  return Math.floor(Math.random() * ((max - 50) - (min + 50)));
}

let difficulty = 50;

const getTrafficCones = () => {
  const cones = [];
  const coneLocations = [];
  for(var i = 0; i < (Math.ceil(Math.random() * (difficulty - 10) + (difficulty))); i++) {
    const randomPos = {top: getRandomWindowPos(0, window.innerHeight), left: getRandomWindowPos(0, window.innerWidth)};
    cones.push(<img src={require('./traffic.png')} alt="traffic cone" className='traffic' style={{top: randomPos.top, left: randomPos.left}} key={`${randomPos.top}${randomPos.left}`} />)
    coneLocations.push(randomPos);
  }
  return {cones: cones, coneLocations: coneLocations};
}

let cones;

const getScores = async () => {
  const response = doc(db, 'wins', 'HYqMpv64MGHf36oWwGR1');
  const collectionSnapshot = await getDoc(response);
  const scores = collectionSnapshot.data();
  return scores;
}

function App() {
  const [pos, setPos] = useState({ });
  const [logo, setLogo] = useState('golinks');
  const [hit, setHit] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [result, setResult] = useState('');
  const [scores, setScores] = useState();
  
  useEffect(() => {
    setTimeout(() => {
      trail = (trail.length > 0) ? trail.slice(1) : trail;
    }, 500);
  }, [pos]);

  useEffect(() => {
    if(!scores) return;
    const updateScores = async () => {
      const scoreRef = doc(db, "wins", "HYqMpv64MGHf36oWwGR1");
      await updateDoc(scoreRef, {
        [logo]: scores[logo]
      });
    }

    updateScores();
  }, [scores]);

  const scoreGetter = async () => {
    const updatedScores = await getScores();
    return updatedScores;
  }
  
  const checkIfClose = (e) => {
    if((e.clientX - pos.X) > 10 || (e.clientX - pos.X) > -10) return true;
    if((e.clientY - pos.Y) > 10 || (e.clientY - pos.Y) > -10) return true;
  }

  const checkForCones = (e) => {
    const checkedCones = cones.coneLocations.map(cone => {
      const posDiff = {x: cone.left - e.clientX, y: cone.top - e.clientY};
      if(posDiff.x > -60 && posDiff.x < -10 && posDiff.y > -80 && posDiff.y < 30) return cone;
    });
    if(checkedCones.find(check => check)) {
      setHit(true);
      setResult('You hit a cone!  You lose 🚗🚧');
    };
  }

  const moveTrail = (e) => {
    if (checkIfClose(e)) return;
    setPos({ x: e.clientX - 10, y: e.clientY + 10 })
    if (!pos.x || !pos.y) return;
    if(trail.find(img => img.key === `${pos.y}${pos.x}`)) return;
    trail.push(<img src={require(`${logoMap[logo]}`)} alt="logo" className='logo' style={{position: 'absolute', top: pos.y, left: pos.x}} key={`${pos.y}${pos.x}`} />)
    if(!gameStart) return;
    checkForCones(e);
  };

  const changeLogo = (e) => {
    setLogo(e.target.value);
    trail = [];
  }

  const startGame = async () => {
    setResult('');
    const newScores = await scoreGetter();
    setScores(newScores);
    setGameStart(true);
    cones = getTrafficCones();
    trail = [];
  }

  const winGame = async () => {
    setScores({...scores, [logo]: scores[logo] + 1});
    setGameStart(false);
    setResult('You win! 🏆');
  }
  
  const restartGame = async () => {
    setHit(false);
    setGameStart(false);
    setLogo('golinks');
    setResult('');
    trail = [];
    cones = [];    
  }

  const sortScores = () => {
    if(!scores) return;
    const sortedScores = Object.keys(scores).sort((a, b) => scores[b] - scores[a]).map(key => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1, 2) + key.charAt(2).toUpperCase() + key.slice(3);
      return <li>{formattedKey}: {scores[key]}</li>
    })
    return sortedScores;
  }

  const handleChange = (e) => {
    difficulty = e.target.value;
  }
  
  return (
    <div className='app-container'>
      {!result && <button style={{top: 25, left: 25}} onClick={startGame}>Start</button>}
      <div className="app" onMouseMove={moveTrail} onTouchStart={moveTrail}>
        {trail.map(img => img)}
          {!result && <>
            {gameStart && cones.cones}
            <p>Select Team:</p>
            <select name='logo' id='logo' onChange={changeLogo}>
              <option value='golinks'>GoLinks</option>
              <option value='gosearch'>GoSearch</option>
              <option value='goprofiles'>GoProfiles</option>
            </select>
          </>}
          <div className='slider-container'>
            <p className='slider-header'>Select Difficulty:</p>
            <Slider
              size="small"
              defaultValue={50}
              aria-label="Small"
              valueLabelDisplay="auto"
              onChange={handleChange}
              className='slider'
              step={10} 
              marks 
              min={10} 
              max={100}
              sx={{
                width:'16.5em'
              }}
            />
          </div>
          {result && <div className='result-container'>
            <p className='result'>{result}</p>
            <ul>
              {sortScores()}
            </ul>
            <button onClick={restartGame} className='reset'>Reset</button>
          </div>}
      </div>
      {(!result && gameStart) && <button style={{top: window.innerHeight - 100, left: window.innerWidth - 175}} onClick={winGame}>Finish</button>}
    </div>
  );
}

export default App;
