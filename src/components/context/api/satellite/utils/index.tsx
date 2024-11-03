export const normalizeLongitude = (longitude: any) => {
    return ((longitude + 180) % 360 + 360) % 360 - 180;
};

export const splitPolyline = (coordinates: any) => {
    const segments = [];
    let currentSegment: any = [];

    coordinates.forEach(([lon, lat]: any) => {
        if (currentSegment.length === 0) {
            currentSegment.push([lon, lat]);
        } else {
            const lastLon = currentSegment[currentSegment.length - 1][0];
            if (Math.abs(lon - lastLon) > 180) {
                segments.push(currentSegment);
                currentSegment = [[ lon, lat ]];
            } else {
                currentSegment.push([ lon, lat ]);
            }
        }
    });

    if (currentSegment.length > 0) {
        segments.push(currentSegment);
    }

    return segments;
};