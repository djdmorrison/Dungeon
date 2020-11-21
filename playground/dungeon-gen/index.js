const dungeon = new Dungeon({
    width: 500,
    height: 500,
    rooms: {
    width: {
        min: 5,
        max: 15
    },
    height: {
        min: 5,
        max: 15
    },
    maxArea: 150,
    maxRooms: 10
    }
});  
  
  // To see what we've got, let's dump the map into an HTML fragment that we can insert into the page.
  // You can control which characters are used & you can also apply HTML attributes to control the
  // style (e.g. class and/or style):
  const html = dungeon.drawToHtml({
    empty: " ",
    wall: "📦",
    floor: "☁️",
    door: "🚪",
    floorAttributes: { style: "opacity: 0.25" },
    containerAttributes: { class: "dungeon", style: "line-height: 1" }
});

document.body.appendChild(html);