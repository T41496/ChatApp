

module.exports=(date)=>{
    let hours=date.getHours();
    let minutes=date.getMinutes();
    let ampm=hours>= 12 ? "PM" : "AM";
    hours=hours%12;
    hours=hours ? hours : 12;//Hours 0 should be 12
    minutes=minutes<10 ? '0'+minutes :minutes;
    return `${hours}:${minutes} ${ampm}`;
}