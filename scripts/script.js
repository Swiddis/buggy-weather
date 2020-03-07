const updateUrl = (city, units) => {
  let api = '76f73d332c6b78d5957608a210a5f8d8';
  return `https://api.openweathermap.org/data/2.5/forecast?lang=en&q=${city}&units=${units}&APPID=${api}`
};

let units = 'imperial', unitSymbol = '&deg;F';
let city = 'Salt Lake City, US';
let url = updateUrl(city, units);
let isNight = false;
let toggles = [false, false, false, false, false];
let dataList = [];

$(document).ready(() => {main();});

const main = () => {
  callWeather();
  setInterval(clockUpdate, 50);
  setupInteractivity();
};

const toggleNightMode = () => {
  if (!isNight) {
    $('body').css({
      'background-color': '#161c1c',
      'color': '#19535f'
    });
    $('#weather').css({'background-color':'#5d5e60'});
    $('.weatherbox').css({'background-color':'#d7c9aa'});
    $('#clock').css({'color':'#d7c9aa'});
    $('#city_input').css({
      'background-color':'#161c1c',
      'color': '#d7c9aa'
    });
    $('#toggle_units').css({
      'transition-duration': '2s',
      'border': '2px solid #5d5e60',
      'background-color': '#161c1c',
      'color': '#d7c9aa'
    });
  } else {
    $('body').css({
      'background-color': '#0087c1',
      'color': '#00171f'
    });
    $('#weather').css({'background-color':'#003459'});
    $('.weatherbox').css({'background-color':'#fff'});
    $('#clock').css({'color':'#fff'});
    $('#city_input').css({
      'background-color':'#0087c1',
      'color': '#fff'
    });
    $('#toggle_units').css({
      'transition-duration': '2s',
      'border': '2px solid #003459',
      'background-color': '#0087c1',
      'color': '#fff'
    });
  }
  isNight = !isNight;
};

const clockUpdate = () => {
  let d = new Date();
  let ds = d.toString().split(' ');
  $('#clock').html('<p>' + ds[0] + ', ' + ds[1] + ' ' + ds[2] + ' ' + ds[3] + '<br>' 
                   + ds[4] + '.' + '' + d.getMilliseconds().toString().charAt(0) + '</p>');
};

const callWeather = () => {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.cod == '200') {
        handleData(data.list);
        $('#city_input').attr('placeholder', city);
      } else {
        $('#city_input').attr('placeholder', '(Error loading city)');
      }
    })
    .catch(err => console.log(err));
};

const dataToHtml = (vals,i) => {
  let dtxt = vals.dt_txt;
  // Extract only date
  if (i == 0) {
    dtxt = 'Today';
  } else if (i == 1) {
    dtxt = 'Tomorrow';
  } else{
    dtxt = dtxt.substring(0, 10);
  }
  let desc = vals.weather[0].description;
  // Capitalization snippet from https://stackoverflow.com/questions/2332811/capitalize-words-in-string/7592235#7592235
  desc = desc.replace(/(?:^|\s)\S/g, a=>{return a.toUpperCase();});
  let temp = vals.main.temp;
  let icon = vals.weather[0].icon;
  // Uncomment this line to force into night mode (change n to d for forcing day mode)
  // icon = icon.substring(0, 2) + 'n';
  if (icon.substring(2, 3) == 'n' && !isNight) toggleNightMode();
  else if (icon.substring(2, 3) == 'd' && isNight) toggleNightMode();
  let iconimg = `http://openweathermap.org/img/wn/${icon}@2x.png`
  let feelsLike = vals.main.feels_like;
  let wind = vals.wind.speed;
  let humidity = vals.main.humidity;
  let s = `<img src='${iconimg}' /><br>${dtxt}<br>${desc}<br>${temp} ${unitSymbol}`;
  s += `<br><br>Feels like: ${feelsLike} ${unitSymbol}<br>Wind: ${wind} mph<br>Humidity: ${humidity}%`;
  return s;
}

// Takes in api's list and returns useful statistics for next days.
const handleData = ls => {
  dataList = ls;
  for (let i = 0; i < 5; i++) {
    s = dataToHtml(ls[8 * i], i);
    $('#wb' + i).html(`<p>${s}</p>`);
  }
};

const setupInteractivity = () => {
  for (let i = 0; i < 5; i++) {
    // let wb = '#wb' + i;
    // Replace all occurrences of '#wb' + i with wb below
    // Why doesn't it work?
    $('#wb' + i).on('mouseover', evt => {
      if (!isNight) {$('#wb' + i).css({'background-color':'#ddd'});}
      else {$('#wb' + i).css({'background-color':'#f7e9ca'});}
    });
    $('#wb' + i).on('mouseout', evt => {
      if (!isNight) {$('#wb' + i).css({'background-color':'#fff'});}
      else {$('#wb' + i).css({'background-color':'#d7c9aa'});}
    });
    $('#wb' + i).on('click', evt => {
      if (!toggles[i]) {
        $('#wb' + i).stop().animate({height:'290px'});
      }
      else {
        $('#wb' + i).stop().animate({height:'200px'});
      }
      toggles[i] = !toggles[i];
    });
  }
  $('#city_input').on('keypress', evt => {
    if (evt.keyCode == 13) { // Enter presesd
      city = $('#city_input').val();
      if (city.length > 0) {
        $('#city_input').val('');
        url = updateUrl(city, units);
        callWeather();
      }
    }
  });
  $('#toggle_units').on('click', evt => {
    if (units == 'imperial') {
      units = 'metric';
      unitSymbol = '&deg;C';
    } else if (units == 'metric') {
      units = 'kelvin';
      unitSymbol = 'K';
    } else {
      units = 'imperial';
      unitSymbol = '&deg;F';
    }
    url = updateUrl(city, units);
    callWeather();
  });
  $('#toggle_units').on('mouseover', evt => {
    if (!isNight) {$('#toggle_units').css({'transition-duration':'0.8s','background-color':'#003459'});}
    else {$('#toggle_units').css({'transition-duration':'0.8s','background-color':'#5d5e60'});}
  });
  $('#toggle_units').on('mouseout', evt => {
    if (!isNight) {$('#toggle_units').css({'transition-duration':'0.8s','background-color':'#0087c1'});}
    else {$('#toggle_units').css({'transition-duration':'0.8s','background-color':'#161c1c'});}
  });
};
