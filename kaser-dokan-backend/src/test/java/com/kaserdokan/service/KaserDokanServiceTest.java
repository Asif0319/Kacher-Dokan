package com.kaserdokan.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class KaserDokanServiceTest {
    @Test void readsMongoNumericStockWithoutTreatingDoublesAsZero() {
        assertEquals(23, KaserDokanService.i(23.0, 0));
        assertEquals(23, KaserDokanService.i(23L, 0));
        assertEquals(23, KaserDokanService.i(23, 0));
        assertEquals(23, KaserDokanService.i("23", 0));
        assertEquals(0, KaserDokanService.i(null, 0));
        assertEquals(0, KaserDokanService.i(Double.NaN, 0));
    }
}
